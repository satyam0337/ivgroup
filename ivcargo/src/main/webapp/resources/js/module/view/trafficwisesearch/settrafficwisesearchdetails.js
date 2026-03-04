/**
 * 
 */
var TruckArrivalDetailsDisplay		= false;
var branchModel						= null;
var trafficWiseSearchDetails		= null;
var destSubRegionAndBranchSummary	= null;
var branchModelSize					= 0;

function setTrafficWiseSearchDetails(response) {
	branchModel							= response.branchModel;
	trafficWiseSearchDetails			= response.trafficWiseSearch;
	destSubRegionAndBranchSummary		= response.destSubRegionAndBranchSummary;
	var branches						= null;
	//TruckArrivalDetailsDisplay			= response.TruckArrivalDetailsDisplay;

	var lengthOfDestSubRegionAndBranchSummary	= 0;

	branchModelSize		= Object.keys(branchModel).length;

	if(destSubRegionAndBranchSummary != undefined)
		lengthOfDestSubRegionAndBranchSummary	= Object.keys(destSubRegionAndBranchSummary).length;

	if(branchModelSize >= 4) {
		changePageScrolling('DataDiv', 'scroll');
		changePageHeight('DataDiv', '500px');
	} else {
		changePageScrolling('DataDiv', 'hidden');
		changePageHeight('DataDiv', '100%');
	}
	
	changePageWidth('trafficSearchDetails', '100%');

	changeDisplayProperty('bottom-border-boxshadow', 'block');
	$("#printTrafficSearchDetails tr").remove();
	$("#trafficSearchDetails tr").remove();

	var tableRow		= createRowInTable('', '', '');
	var titleColumn		= createColumnInRow(tableRow, '', 'tableHeader', '110px;', '', '', '');

	appendValueInTableCol(titleColumn, '<b>' + 'Source Branches/ <br>Destination' + '</b>');

	for(key in branchModel) {
		if(branchModel.hasOwnProperty(key)) {
			var branches		= branchModel[key];

			var branchName		= branches.sourceBranchName;
			var totalPendingLR	= branches.totalPendingLR;
			var totalArrivalLR	= branches.totalArrivalLR;

			if((totalPendingLR + totalArrivalLR) > 0) {
				var column			= createColumnInRow(tableRow, '', 'tableHeader', '245px;', 'center', '', '');
	
				//checkBoxForSourceBranches(column, branchId);
				appendValueInTableCol(column, '<b>' + branchName + '</b>');
			}
		}
	}

	var totalCol		= createColumnInRow(tableRow, '', 'tableHeader', '245px;', '', '', '');
	appendValueInTableCol(totalCol, 'Left To Right Total');

	appendRowInTable('fixedHeader', tableRow);

	var i	= 1;

	for(key in trafficWiseSearchDetails) {
		var tableRow2		= createRowInTable('', '', 'width: 100%;');
		appendRowInTable('trafficSearchDetails', tableRow2);

		if(trafficWiseSearchDetails.hasOwnProperty(key)) {
			createShowHideButton(tableRow2, key);
			/*
			 * Inside Details Code Start
			 */
			if(lengthOfDestSubRegionAndBranchSummary > 0)
				setDestSubRegionAndBranchSummary(destSubRegionAndBranchSummary, key);
			
			/*
			 * Inside Details Code End
			 */
			
			setSubRegionWiseSummary(trafficWiseSearchDetails, tableRow2, key);

			i++;
		}
	}

	setTopToBottomTotalRow();
	
	var tbl = document.getElementById("trafficSearchDetails");

	if (tbl != null) {
		for (var i = 0; i < tbl.rows.length; i++) {
			for (var j = 0; j < tbl.rows[i].cells.length; j++) {
				tbl.rows[i].cells[j].onclick = function () {
					if(typeof getval != 'undefined')
						getval(this); 
				};
			}
		}
	}

	//printTable(response, 'trafficSearchDetails', 'printTrafficSearchDetails', 'Traffic Wise Summary', 'printTrafficSearchDetails');
}

function createShowHideButton(tableRow2, key) {
	if(branchModelSize <= 2)
		var subregionNameCol	= createColumnInRow(tableRow2, '', 'tableLeftCol', '240px;', '', '', '');
	else
		var subregionNameCol	= createColumnInRow(tableRow2, '', 'tableLeftCol', '160px;', '', '', '');
	
	if(destSubRegionAndBranchSummary != undefined) {
		var plusLinkButtonObject	= new Object();
		var minusLinkButtonObject	= new Object();

		plusLinkButtonObject.class		= 'showDetails plus_' + key.split('_')[1];
		plusLinkButtonObject.id			= 'plus_' + key.split('_')[1];
		plusLinkButtonObject.html		= '<i class="fa fa-plus-square"></i>';

		//function calling from genericfunction.js
		var newLinkAttr					= createHyperLink(plusLinkButtonObject);
		
		minusLinkButtonObject.class		= 'hideDetails minus_' + key.split('_')[1];
		minusLinkButtonObject.id		= 'minus_' + key.split('_')[1];
		minusLinkButtonObject.style		= 'display: none';
		minusLinkButtonObject.html		= '<i class="fa fa-minus-square"></i>';

		var newMinusLinkAttr			= createHyperLink(minusLinkButtonObject);

		appendValueInTableCol(subregionNameCol, key.split('_')[0] + '<br>');
		appendValueInTableCol(subregionNameCol, newLinkAttr);
		appendValueInTableCol(subregionNameCol, newMinusLinkAttr);
	} else
		appendValueInTableCol(subregionNameCol, key.split('_')[0]);
}

function setSubRegionWiseSummary(trafficWiseSearchDetails, tableRow2, key) {
	var rightTotalPendingLRSubRegion				= 0;
	var rightTotalPendingWeightSubRegion			= 0;
	var rightTotalPendingQuantitySubRegion			= 0;
	var rightTotalPendingAmountSubRegion			= 0;
	var rightTotalArrivalLRSubRegion				= 0;
	var rightTotalArrivalWeightSubRegion			= 0;
	var rightTotalArrivalAmountSubRegion			= 0;
	var rightTotalArrivalQuantitySubRegion			= 0;
	var rightGrandTotal								= 0;
	
	var subRegionWiseSummary	= trafficWiseSearchDetails[key];
	
	for(var key1 in branchModel) {
		if(branchModel.hasOwnProperty(key1)) {
			var branches		= branchModel[key1];
			
			var totalPendingArrivalLR 	= branches.totalPendingLR;
			
			if(TruckArrivalDetailsDisplay)
				totalPendingArrivalLR	= branches.totalPendingLR + branches.totalArrivalLR;

			var trafficWiseSearch		= subRegionWiseSummary[(branches.sourceBranchName) + '_' + branches.sourceBranchId];

			rightTotalPendingLRSubRegion			+= trafficWiseSearch.totalPendingLR;
			rightTotalPendingWeightSubRegion		+= trafficWiseSearch.totalPendingWeight;
			rightTotalPendingQuantitySubRegion		+= trafficWiseSearch.totalPendingQuantity;
			rightTotalPendingAmountSubRegion		+= trafficWiseSearch.totalPendingAmount;
			rightTotalArrivalLRSubRegion			+= trafficWiseSearch.totalArrivalLR;
			rightTotalArrivalWeightSubRegion		+= trafficWiseSearch.totalArrivalWeight;
			rightTotalArrivalAmountSubRegion		+= trafficWiseSearch.totalArrivalAmount;
			rightTotalArrivalQuantitySubRegion		+= trafficWiseSearch.totalArrivalQuantity;
			
			rightGrandTotal					= rightTotalPendingLRSubRegion + rightTotalPendingWeightSubRegion + rightTotalPendingQuantitySubRegion + rightTotalPendingAmountSubRegion + rightTotalArrivalLRSubRegion + rightTotalArrivalWeightSubRegion + rightTotalArrivalAmountSubRegion + rightTotalArrivalQuantitySubRegion;

			if(totalPendingArrivalLR > 0) {
				var newTable				= createTable('newTable_' + removeAllWhiteSpace(key) + '_' + removeAllWhiteSpace(key1), 'insideTable', '1', '100%');
	
				if(branchModelSize <= 2)
					var detailsRowCol		= createColumnInRow(tableRow2, 'detailsRow_' + removeAllWhiteSpace(key) + '_' + removeAllWhiteSpace(key1), '', '520px;', '', '', '');
				else
					var detailsRowCol		= createColumnInRow(tableRow2, 'detailsRow_' + removeAllWhiteSpace(key) + '_' + removeAllWhiteSpace(key1), '', '450px;', '', '', '');
				
				appendValueInTableCol(detailsRowCol, newTable);
	
				var insideHeaderRow			= createRowInTable('', '', '');
				var insidePendingRow		= createRowInTable('', '', '');
				
				if(TruckArrivalDetailsDisplay) {
					var insideArrivalRow	= createRowInTable('', '', '');
					var insidePendAndArrRow	= createRowInTable('', '', '');
				}
				
				appendRowInTable('newTable_' + removeAllWhiteSpace(key) + '_' + removeAllWhiteSpace(key1), insideHeaderRow);
				appendRowInTable('newTable_' + removeAllWhiteSpace(key) + '_' + removeAllWhiteSpace(key1), insidePendingRow);
				
				if(TruckArrivalDetailsDisplay) {
					appendRowInTable('newTable_' + removeAllWhiteSpace(key) + '_' + removeAllWhiteSpace(key1), insideArrivalRow);
					appendRowInTable('newTable_' + removeAllWhiteSpace(key) + '_' + removeAllWhiteSpace(key1), insidePendAndArrRow);
				}
				
				var forColumn						= createColumnInRow(insideHeaderRow, '', '', '', '', '', '');
				var insideTotalPendingLRCol			= createColumnInRow(insideHeaderRow, '', '', '', 'center', '', '');
				var insideTotalPendingWeightCol		= createColumnInRow(insideHeaderRow, '', '', '', 'center', '', '');
				var insideTotalPendingAmountCol		= createColumnInRow(insideHeaderRow, '', '', '', 'center', '', '');
				var insideTotalPendingQuantityCol	= createColumnInRow(insideHeaderRow, '', '', '', 'center', '', '');
	
				var forPendingDispatchCol			= createColumnInRow(insidePendingRow, '', '', '', '', '', '');
				var totalPendingLRCol				= createColumnInRow(insidePendingRow, 'pendingTotalLR_' + branches.sourceBranchId + '_' + key.split('_')[1], '', '', 'right', '', '');
				var totalPendingWeightCol			= createColumnInRow(insidePendingRow, 'pendingTotalWeight_' + branches.sourceBranchId + '_' + key.split('_')[1], '', '', 'right', '', '');
				var totalPendingAmountCol			= createColumnInRow(insidePendingRow, 'pendingTotalAmount_' + branches.sourceBranchId + '_' + key.split('_')[1], '', '', 'right', '', '');
				var totalPendingQuantityCol			= createColumnInRow(insidePendingRow, 'pendingTotalQuantity_' + branches.sourceBranchId + '_' + key.split('_')[1], '', '', 'right', '', '');
	
				if(TruckArrivalDetailsDisplay) {
					var forArrivalDetailsCol		= createColumnInRow(insideArrivalRow, '', '', '', '', '', '');
					var totalArrivalLRCol			= createColumnInRow(insideArrivalRow, 'arrivalTotalLR_' + branches.sourceBranchId + '_' + key.split('_')[1], '', '', 'right', '', '');
					var totalArrivalWeightCol		= createColumnInRow(insideArrivalRow, 'arrivalTotalWeight_' + branches.sourceBranchId + '_' + key.split('_')[1], '', '', 'right', '', '');
					var totalArrivalAmountCol		= createColumnInRow(insideArrivalRow, 'arrivalTotalAmount_' + branches.sourceBranchId + '_' + key.split('_')[1], '', '', 'right', '', '');
					var totalArrivalQuantityCol		= createColumnInRow(insideArrivalRow, 'arrivalTotalQuantity_' + branches.sourceBranchId + '_' + key.split('_')[1], '', '', 'right', '', '');
					
					var forPendAndArrCol			= createColumnInRow(insidePendAndArrRow, '', '', '', '', '', '');
					var totalPendAndArrLRCol		= createColumnInRow(insidePendAndArrRow, 'pendAndArrTotalLR_' + branches.sourceBranchId + '_' + key.split('_')[1], '', '', 'right', '', '');
					var totalPendAndArrWeightCol	= createColumnInRow(insidePendAndArrRow, 'pendAndArrTotalWeight_' + branches.sourceBranchId + '_' + key.split('_')[1], '', '', 'right', '', '');
					var totalPendAndArrAmountCol	= createColumnInRow(insidePendAndArrRow, 'pendAndArrTotalAmount_' + branches.sourceBranchId + '_' + key.split('_')[1], '', '', 'right', '', '');
					var totalPendAndArrQuantityCol	= createColumnInRow(insidePendAndArrRow, 'pendAndArrTotalQuantity_' + branches.sourceBranchId + '_' + key.split('_')[1], '', '', 'right', '', '');
				}
	
				appendValueInTableCol(forColumn, '');
				appendValueInTableCol(insideTotalPendingLRCol, '<b>Total LR</b>');
				appendValueInTableCol(insideTotalPendingWeightCol, '<b>Total Weight</b>');
				appendValueInTableCol(insideTotalPendingAmountCol, '<b>Total Amount</b>');
				appendValueInTableCol(insideTotalPendingQuantityCol, '<b>Total Articles</b>');
	
				appendValueInTableCol(forPendingDispatchCol, '<b>PD</b>');
				appendValueInTableCol(totalPendingLRCol, trafficWiseSearch.totalPendingLR);
				appendValueInTableCol(totalPendingWeightCol, trafficWiseSearch.totalPendingWeight);
				appendValueInTableCol(totalPendingAmountCol, Math.round(trafficWiseSearch.totalPendingAmount));
				appendValueInTableCol(totalPendingQuantityCol, trafficWiseSearch.totalPendingQuantity);
	
				if(TruckArrivalDetailsDisplay) {
					appendValueInTableCol(forArrivalDetailsCol, '<b>Arrival</b>');
					appendValueInTableCol(totalArrivalLRCol, trafficWiseSearch.totalArrivalLR);
					appendValueInTableCol(totalArrivalWeightCol, trafficWiseSearch.totalArrivalWeight);
					appendValueInTableCol(totalArrivalAmountCol, Math.round(trafficWiseSearch.totalArrivalAmount));
					appendValueInTableCol(totalArrivalQuantityCol, trafficWiseSearch.totalArrivalQuantity);
					
					appendValueInTableCol(forPendAndArrCol, '<b>Total</b>');
					appendValueInTableCol(totalPendAndArrLRCol, trafficWiseSearch.totalPendingLR + trafficWiseSearch.totalArrivalLR);
					appendValueInTableCol(totalPendAndArrWeightCol, trafficWiseSearch.totalPendingWeight + trafficWiseSearch.totalArrivalWeight);
					appendValueInTableCol(totalPendAndArrAmountCol, Math.round(trafficWiseSearch.totalPendingAmount) + Math.round(trafficWiseSearch.totalArrivalAmount));
					appendValueInTableCol(totalPendAndArrQuantityCol, trafficWiseSearch.totalPendingQuantity + trafficWiseSearch.totalArrivalQuantity);
				}
			}
		}
	}

	/*
	 * Right Total Code Start
	 */
	if(rightGrandTotal > 0)
		setLeftToRightTotal(tableRow2, key, rightTotalPendingLRSubRegion, rightTotalPendingWeightSubRegion, rightTotalPendingAmountSubRegion, rightTotalPendingQuantitySubRegion, rightTotalArrivalLRSubRegion, rightTotalArrivalWeightSubRegion, rightTotalArrivalAmountSubRegion, rightTotalArrivalQuantitySubRegion);
	/*
	 * Right Total Code Start
	 */
}

function setDestSubRegionAndBranchSummary(destSubRegionAndBranchSummary, key) {
	var destWiseSubRegionSummary	= destSubRegionAndBranchSummary[key];

	for(var key3 in destWiseSubRegionSummary) {
		var rightTotalPendingLR				= 0;
		var rightTotalPendingWeight			= 0;
		var rightTotalPendingQuantity		= 0;
		var rightTotalPendingAmount			= 0;
		var rightTotalArrivalLR				= 0;
		var rightTotalArrivalWeight			= 0;
		var rightTotalArrivalAmount			= 0;
		var rightTotalArrivalQuantity		= 0;

		var sourceWiseSummary	= destWiseSubRegionSummary[key3];

		var createNewRow		= createRowInTable('showhidesubregiondetails_' + key.split('_')[1], 'showhidesubregiondetails_' + key.split('_')[1], 'display: none');
		appendRowInTable('trafficSearchDetails', createNewRow);

		var subBranchesCol	= createColumnInRow(createNewRow, '', '', '', 'center', '', '');

		//checkBoxForSubRegionBranches(subBranchesCol, key, key3);
		appendValueInTableCol(subBranchesCol, key3.split('_')[0]);

		for(var key4 in branchModel) {
			if(branchModel.hasOwnProperty(key4)) {
				var branches			= branchModel[key4];
				
				var totalPendingArrivalLR 	= branches.totalPendingLR;
				
				if(TruckArrivalDetailsDisplay)
					totalPendingArrivalLR	= branches.totalPendingLR + branches.totalArrivalLR;
				
				var trafficWiseSearch	= sourceWiseSummary[(branches.sourceBranchName) + '_' + branches.sourceBranchId];

				rightTotalPendingLR				+= trafficWiseSearch.totalPendingLR;
				rightTotalPendingWeight			+= trafficWiseSearch.totalPendingWeight;
				rightTotalPendingQuantity		+= trafficWiseSearch.totalPendingQuantity;
				rightTotalPendingAmount			+= trafficWiseSearch.totalPendingAmount;
				rightTotalArrivalLR				+= trafficWiseSearch.totalArrivalLR;
				rightTotalArrivalWeight			+= trafficWiseSearch.totalArrivalWeight;
				rightTotalArrivalAmount			+= trafficWiseSearch.totalArrivalAmount;
				rightTotalArrivalQuantity		+= trafficWiseSearch.totalArrivalQuantity;
				
				if(totalPendingArrivalLR > 0) {
					var newTable			= createTable('newTable_' + removeAllWhiteSpace(key3) + '_' + removeAllWhiteSpace(key4), 'insideTable', '1', '100%');
	
					if(branchModelSize <= 2)
						var detailsRowCol	= createColumnInRow(createNewRow, 'detailsRow_' + removeAllWhiteSpace(key3) + '_' + removeAllWhiteSpace(key4), '', '520px;', '', '', '');
					else
						var detailsRowCol	= createColumnInRow(createNewRow, 'detailsRow_' + removeAllWhiteSpace(key3) + '_' + removeAllWhiteSpace(key4), '', '450px;', '', '', '');
					
					appendValueInTableCol(detailsRowCol, newTable);
	
					var insideHeaderRow		= createRowInTable('', '', '');
					var insidePendingRow	= createRowInTable('', '', '');
					
					if(TruckArrivalDetailsDisplay) {
						var insideArrivalRow			= createRowInTable('', '', '');
						var insidePendAndArrTotalRow	= createRowInTable('', '', '');
					}
	
					appendRowInTable('newTable_' + removeAllWhiteSpace(key3) + '_' + removeAllWhiteSpace(key4), insideHeaderRow);
					appendRowInTable('newTable_' + removeAllWhiteSpace(key3) + '_' + removeAllWhiteSpace(key4), insidePendingRow);
					
					if(TruckArrivalDetailsDisplay) {
						appendRowInTable('newTable_' + removeAllWhiteSpace(key3) + '_' + removeAllWhiteSpace(key4), insideArrivalRow);
						appendRowInTable('newTable_' + removeAllWhiteSpace(key3) + '_' + removeAllWhiteSpace(key4), insidePendAndArrTotalRow);
					}
					
					var forColumn						= createColumnInRow(insideHeaderRow, '', '', '', '', '', '');
					var insideTotalPendingLRCol			= createColumnInRow(insideHeaderRow, '', '', '', 'center', '', '');
					var insideTotalPendingWeightCol		= createColumnInRow(insideHeaderRow, '', '', '', 'center', '', '');
					var insideTotalPendingAmountCol		= createColumnInRow(insideHeaderRow, '', '', '', 'center', '', '');
					var insideTotalPendingQuantityCol	= createColumnInRow(insideHeaderRow, '', '', '', 'center', '', '');
	
					var forPendingDispatchCol			= createColumnInRow(insidePendingRow, '', '', '', '', '', '');
					var totalPendingLRCol				= createColumnInRow(insidePendingRow, '', '', '', 'right', '', '');
					var totalPendingWeightCol			= createColumnInRow(insidePendingRow, '', '', '', 'right', '', '');
					var totalPendingAmountCol			= createColumnInRow(insidePendingRow, '', '', '', 'right', '', '');
					var totalPendingQuantityCol			= createColumnInRow(insidePendingRow, '', '', '', 'right', '', '');
	
					if(TruckArrivalDetailsDisplay) {
						var forArrivalDetailsCol			= createColumnInRow(insideArrivalRow, '', '', '', '', '', '');
						var totalArrivalLRCol				= createColumnInRow(insideArrivalRow, '', '', '', 'right', '', '');
						var totalArrivalWeightCol			= createColumnInRow(insideArrivalRow, '', '', '', 'right', '', '');
						var totalArrivalAmountCol			= createColumnInRow(insideArrivalRow, '', '', '', 'right', '', '');
						var totalArrivalQuantityCol			= createColumnInRow(insideArrivalRow, '', '', '', 'right', '', '');
						
						var forPendAndArrCol				= createColumnInRow(insidePendAndArrTotalRow, '', '', '', '', '', '');
						var totalPendAndArrLRCol			= createColumnInRow(insidePendAndArrTotalRow, '', '', '', 'right', '', '');
						var totalPendAndArrWeightCol		= createColumnInRow(insidePendAndArrTotalRow, '', '', '', 'right', '', '');
						var totalPendAndArrAmountCol		= createColumnInRow(insidePendAndArrTotalRow, '', '', '', 'right', '', '');
						var totalPendAndArrQuantityCol		= createColumnInRow(insidePendAndArrTotalRow, '', '', '', 'right', '', '');
					}
					
					appendValueInTableCol(forColumn, '');
					appendValueInTableCol(insideTotalPendingLRCol, '<b>Total LR</b>');
					appendValueInTableCol(insideTotalPendingWeightCol, '<b>Total Weight</b>');
					appendValueInTableCol(insideTotalPendingAmountCol, '<b>Total Amount</b>');
					appendValueInTableCol(insideTotalPendingQuantityCol, '<b>Total Articles</b>');
	
					appendValueInTableCol(forPendingDispatchCol, '<b>PD</b>');
					appendValueInTableCol(totalPendingLRCol, trafficWiseSearch.totalPendingLR);
					appendValueInTableCol(totalPendingWeightCol, trafficWiseSearch.totalPendingWeight);
					appendValueInTableCol(totalPendingAmountCol, Math.round(trafficWiseSearch.totalPendingAmount));
					appendValueInTableCol(totalPendingQuantityCol, trafficWiseSearch.totalPendingQuantity);
	
					if(TruckArrivalDetailsDisplay) {
						appendValueInTableCol(forArrivalDetailsCol, '<b>Arrival</b>');
						appendValueInTableCol(totalArrivalLRCol, trafficWiseSearch.totalArrivalLR);
						appendValueInTableCol(totalArrivalWeightCol, trafficWiseSearch.totalArrivalWeight);
						appendValueInTableCol(totalArrivalAmountCol, Math.round(trafficWiseSearch.totalArrivalAmount));
						appendValueInTableCol(totalArrivalQuantityCol, trafficWiseSearch.totalArrivalQuantity);
						
						appendValueInTableCol(forPendAndArrCol, '<b>Total</b>');
						appendValueInTableCol(totalPendAndArrLRCol, trafficWiseSearch.totalPendingLR + trafficWiseSearch.totalArrivalLR);
						appendValueInTableCol(totalPendAndArrWeightCol, trafficWiseSearch.totalPendingWeight + trafficWiseSearch.totalArrivalWeight);
						appendValueInTableCol(totalPendAndArrAmountCol, Math.round(trafficWiseSearch.totalPendingAmount) + Math.round(trafficWiseSearch.totalArrivalAmount));
						appendValueInTableCol(totalPendAndArrQuantityCol, trafficWiseSearch.totalPendingQuantity + trafficWiseSearch.totalArrivalQuantity);
					}
				}
			}
		}

		setRightSideTotalForDestWiseSubRegionSummary(createNewRow, key3, rightTotalPendingLR, rightTotalPendingWeight, rightTotalPendingAmount, rightTotalPendingQuantity, rightTotalArrivalLR, rightTotalArrivalWeight, rightTotalArrivalAmount, rightTotalArrivalQuantity);
	}
}

function calculateTotal() {
	var trafficTable	= document.getElementById('trafficSearchDetails');
	var inputs		 	= trafficTable.getElementsByTagName("input");
	var len			 	= inputs.length;
	
	var isAnyBranchSelected    			= false;
	
	var grandPendingDispatchLr			= 0;
	var grandPendingDispatchWeight		= 0;
	var grandPendingDispatchAmount		= 0;
	var grandPendingDispatchQuantity	= 0;
	
	var grandTruckArrivalLr				= 0;
	var grandTruckArrivalWeight			= 0;
	var grandTruckArrivalAmount			= 0;
	var grandTruckArrivalQuantity		= 0;	
	
	for(var i = 0; i < len; i++) {
		if(inputs[i].type == 'checkbox') {
			var srId = inputs[i].id.split("_")[1];
			console.log('srId = '+srId);
			
			if(/subRegion_/i.test(inputs[i].id) && document.getElementById(inputs[i].id).checked == true) {
				for(var j = 0; j < len; j++) {
					var srcBranchId 	= inputs[j].id.split("_")[1];
					
					var isBranchSelected = /branch_/i.test(inputs[j].id) && document.getElementById(inputs[j].id).checked;
					
					if(isBranchSelected) {
						isAnyBranchSelected = true;
						
						var pendingDispatchLr		=  getValueFromHtmlTag('pendingTotalLR_'+srcBranchId+"_"+srId);
						var pendingDispatchWeight 	=  getValueFromHtmlTag('pendingTotalWeight_'+srcBranchId+"_"+srId);
						var pendingDispatchAmount 	=  getValueFromHtmlTag('pendingTotalAmount_'+srcBranchId+"_"+srId);
						var pendingDispatchQuantity =  getValueFromHtmlTag('pendingTotalQuantity_'+srcBranchId+"_"+srId);
						
						var truckArrivalLr			=  getValueFromHtmlTag('arrivalTotalLR_'+srcBranchId+"_"+srId);
						var truckArrivalWeight 		=  getValueFromHtmlTag('arrivalTotalWeight_'+srcBranchId+"_"+srId);
						var truckArrivalAmount 		=  getValueFromHtmlTag('arrivalTotalAmount_'+srcBranchId+"_"+srId);
						var truckArrivalQuantity 	=  getValueFromHtmlTag('arrivalTotalQuantity_'+srcBranchId+"_"+srId);
						
						grandPendingDispatchLr 			+= parseInt(pendingDispatchLr);
						grandPendingDispatchWeight		+= parseInt(pendingDispatchWeight);	
						grandPendingDispatchAmount		+= parseInt(pendingDispatchAmount);
						grandPendingDispatchQuantity 	+= parseInt(pendingDispatchQuantity);
						
						grandTruckArrivalLr				+= parseInt(truckArrivalLr);
						grandTruckArrivalWeight			+= parseInt(truckArrivalWeight);
						grandTruckArrivalAmount			+= parseInt(truckArrivalAmount);
						grandTruckArrivalQuantity		+= parseInt(truckArrivalQuantity);
					} 
				} 

				if(!isAnyBranchSelected) {
					var gt = getValueFromHtmlTag("weight_"+srId);
					grandTotal += parseInt(gt.value);
				}
				
				document.getElementById('total').innerHTML = "<font size=2><b>Total Actual Weight : </b></font>"+'<font  size=2><b>'+grandTotal+'</b></font>';
			}
		}
	}
}

function setLeftToRightTotal(tableRow2, key, rightTotalPendingLRSubRegion, rightTotalPendingWeightSubRegion, rightTotalPendingAmountSubRegion, rightTotalPendingQuantitySubRegion, rightTotalArrivalLRSubRegion, rightTotalArrivalWeightSubRegion, rightTotalArrivalAmountSubRegion, rightTotalArrivalQuantitySubRegion) {
	var newTableForTotal			= createTable('newTable_Total_' + removeAllWhiteSpace(key), '', '1', '100%');

	if(branchModelSize <= 2)
		var totalRowCol		= createColumnInRow(tableRow2, 'detailsRow_Total_' + removeAllWhiteSpace(key), '', '520px;', '', '', '');
	else
		var totalRowCol		= createColumnInRow(tableRow2, 'detailsRow_Total_' + removeAllWhiteSpace(key), '', '450px;', '', '', '');
	
	appendValueInTableCol(totalRowCol, newTableForTotal);

	var rightTotalRow			= createRowInTable('', '', '');
	var rightTotalPendingRow	= createRowInTable('', '', '');
	
	if(TruckArrivalDetailsDisplay) {
		var rightTotalArrivalRow	= createRowInTable('', '', '');
		var rightTotalPendAndArrRow	= createRowInTable('', '', '');
	}

	appendRowInTable('newTable_Total_' + removeAllWhiteSpace(key), rightTotalRow);
	appendRowInTable('newTable_Total_' + removeAllWhiteSpace(key), rightTotalPendingRow);
	
	if(TruckArrivalDetailsDisplay) {
		appendRowInTable('newTable_Total_' + removeAllWhiteSpace(key), rightTotalArrivalRow);
		appendRowInTable('newTable_Total_' + removeAllWhiteSpace(key), rightTotalPendAndArrRow);
	}

	var forColumn						= createColumnInRow(rightTotalRow, '', '', '', 'center', '', '');
	var rightTotalLRCol					= createColumnInRow(rightTotalRow, '', '', '', 'center', '', '');
	var rightTotalWeightCol				= createColumnInRow(rightTotalRow, '', '', '', 'center', '', '');
	var rightTotalAmountCol				= createColumnInRow(rightTotalRow, '', '', '', 'center', '', '');
	var rightTotalQuantityCol			= createColumnInRow(rightTotalRow, '', '', '', 'center', '', '');

	var forPendingDispatchCol			= createColumnInRow(rightTotalPendingRow, '', '', '', '', '', '');
	var rightTotalPendingLRCol			= createColumnInRow(rightTotalPendingRow, '', '', '', 'right', '', '');
	var rightTotalPendingWeightCol		= createColumnInRow(rightTotalPendingRow, '', '', '', 'right', '', '');
	var rightTotalPendingAmountCol		= createColumnInRow(rightTotalPendingRow, '', '', '', 'right', '', '');
	var rightTotalPendingQuantityCol	= createColumnInRow(rightTotalPendingRow, '', '', '', 'right', '', '');

	if(TruckArrivalDetailsDisplay) {
		var forArrivalDetailsCol			= createColumnInRow(rightTotalArrivalRow, '', '', '', '', '', '');
		var rightTotalArrivalLRCol			= createColumnInRow(rightTotalArrivalRow, '', '', '', 'right', '', '');
		var rightTotalArrivalWeightCol		= createColumnInRow(rightTotalArrivalRow, '', '', '', 'right', '', '');
		var rightTotalArrivalAmountCol		= createColumnInRow(rightTotalArrivalRow, '', '', '', 'right', '', '');
		var rightTotalArrivalQuantityCol	= createColumnInRow(rightTotalArrivalRow, '', '', '', 'right', '', '');
		
		var forPendAndArrCol				= createColumnInRow(rightTotalPendAndArrRow, '', '', '', '', '', '');
		var rightTotalPendAndArrLRCol		= createColumnInRow(rightTotalPendAndArrRow, '', '', '', 'right', '', '');
		var rightTotalPendAndArrWeightCol	= createColumnInRow(rightTotalPendAndArrRow, '', '', '', 'right', '', '');
		var rightTotalPendAndArrAmountCol	= createColumnInRow(rightTotalPendAndArrRow, '', '', '', 'right', '', '');
		var rightTotalPendAndArrQuantityCol	= createColumnInRow(rightTotalPendAndArrRow, '', '', '', 'right', '', '');
	}
	
	appendValueInTableCol(forColumn, '');
	appendValueInTableCol(rightTotalLRCol, '<b>Total LR</b>');
	appendValueInTableCol(rightTotalWeightCol, '<b>Total Weight</b>');
	appendValueInTableCol(rightTotalAmountCol, '<b>Total Amount</b>');
	appendValueInTableCol(rightTotalQuantityCol, '<b>Total Articles</b>');

	appendValueInTableCol(forPendingDispatchCol, '<b>PD</b>');
	appendValueInTableCol(rightTotalPendingLRCol, rightTotalPendingLRSubRegion);
	appendValueInTableCol(rightTotalPendingWeightCol, rightTotalPendingWeightSubRegion);
	appendValueInTableCol(rightTotalPendingAmountCol, Math.round(rightTotalPendingAmountSubRegion));
	appendValueInTableCol(rightTotalPendingQuantityCol, rightTotalPendingQuantitySubRegion);

	if(TruckArrivalDetailsDisplay) {
		appendValueInTableCol(forArrivalDetailsCol, '<b>Arrival</b>');
		appendValueInTableCol(rightTotalArrivalLRCol, rightTotalArrivalLRSubRegion);
		appendValueInTableCol(rightTotalArrivalWeightCol, rightTotalArrivalWeightSubRegion);
		appendValueInTableCol(rightTotalArrivalAmountCol, Math.round(rightTotalArrivalAmountSubRegion));
		appendValueInTableCol(rightTotalArrivalQuantityCol, rightTotalArrivalQuantitySubRegion);
		
		appendValueInTableCol(forPendAndArrCol, '<b>Total</b>');
		appendValueInTableCol(rightTotalPendAndArrLRCol, rightTotalPendingLRSubRegion + rightTotalArrivalLRSubRegion);
		appendValueInTableCol(rightTotalPendAndArrWeightCol, rightTotalPendingWeightSubRegion + rightTotalArrivalWeightSubRegion);
		appendValueInTableCol(rightTotalPendAndArrAmountCol, Math.round(rightTotalPendingAmountSubRegion) + Math.round(rightTotalArrivalAmountSubRegion));
		appendValueInTableCol(rightTotalPendAndArrQuantityCol, rightTotalPendingQuantitySubRegion + rightTotalArrivalQuantitySubRegion);
	}
}

function setTopToBottomTotalRow() {
	var bottomGrandTotalLR					= 0;
	var bottomGrandTotalWeight				= 0; 
	var bottomGrandTotalAmount				= 0; 
	var bottomGrandTotalQuantity			= 0;

	var bottomTotalRow		= createRowInTable('', '', '');
	appendRowInTable('trafficSearchDetails', bottomTotalRow);

	var bottomTotalNameCol	= createColumnInRow(bottomTotalRow, '', 'bottomTotalCol', '', '', '', '');

	appendValueInTableCol(bottomTotalNameCol, '<b>Top To Bottom Total</b>');

	for(var key5 in branchModel) {
		var totalPendingArrivalLR			= 0;
		var totalPendingArrivalWeight		= 0; 
		var totalPendingArrivalAmount		= 0; 
		var totalPendingArrivalQuantity		= 0;
		
		if(branchModel.hasOwnProperty(key5)) {
			var branches			= branchModel[key5];
			
			totalPendingArrivalLR		= branches.totalPendingLR;
			totalPendingArrivalWeight	= branches.totalPendingWeight;
			totalPendingArrivalAmount	= branches.totalPendingAmount;
			totalPendingArrivalQuantity	= branches.totalPendingQuantity;
			
			if(TruckArrivalDetailsDisplay) {
				totalPendingArrivalLR		= branches.totalPendingLR 		+ branches.totalArrivalLR;
				totalPendingArrivalWeight	= branches.totalPendingWeight 	+ branches.totalArrivalWeight;
				totalPendingArrivalAmount	= branches.totalPendingAmount 	+ branches.totalArrivalAmount;
				totalPendingArrivalQuantity	= branches.totalPendingQuantity + branches.totalArrivalQuantity;
			}
			
			if(totalPendingArrivalLR > 0) {
				/*
				 * Bottom Total Code Start
				 */
					setTopToBottomTotal(key5, bottomTotalRow, totalPendingArrivalLR, totalPendingArrivalWeight, totalPendingArrivalAmount, totalPendingArrivalQuantity);
				/*
				 * Bottom Total Code End
				 */
			}
		}

		bottomGrandTotalLR			+= totalPendingArrivalLR;
		bottomGrandTotalWeight		+= totalPendingArrivalWeight;
		bottomGrandTotalAmount		+= totalPendingArrivalAmount;
		bottomGrandTotalQuantity	+= totalPendingArrivalQuantity;
	}

	/*
	 * Grand Total Code Start
	 */
	if(bottomGrandTotalLR > 0)
		setTotalGrandTotal(bottomTotalRow, bottomGrandTotalLR, bottomGrandTotalWeight, bottomGrandTotalAmount, bottomGrandTotalQuantity);
	/*
	 * Grand Total Code End
	 */
}

function setTopToBottomTotal(key5, bottomTotalRow, bottomTotalLR, bottomTotalWeight, bottomTotalAmount, bottomTotalQuantity) {
	var bottomTotalTable			= createTable('bottomTotalTable_' + removeAllWhiteSpace(key5), 'bottomTotalTable', '1', '100%');

	var detailsRowCol				= createColumnInRow(bottomTotalRow, 'bottomTotalRow_' + removeAllWhiteSpace(key5), '', '', '', '', '');
	appendValueInTableCol(detailsRowCol, bottomTotalTable);

	var bottomTotalHeaderRow		= createRowInTable('', '', '');

	appendRowInTable('bottomTotalTable_' + removeAllWhiteSpace(key5), bottomTotalHeaderRow);

	var forDetailsCol				= createColumnInRow(bottomTotalHeaderRow, '', '', '50px;', '', '', '');
	var totalLRCol					= createColumnInRow(bottomTotalHeaderRow, 'totalLRCol', '', '', 'right', '', '');
	var totalWeightCol				= createColumnInRow(bottomTotalHeaderRow, 'totalWeightCol', '', '', 'right', '', '');
	var totalAmountCol				= createColumnInRow(bottomTotalHeaderRow, 'totalAmountCol', '', '', 'right', '', '');
	var totalQuantityCol			= createColumnInRow(bottomTotalHeaderRow, 'totalQuantityCol', '', '', 'right', '', '');

	appendValueInTableCol(forDetailsCol, '');
	appendValueInTableCol(totalLRCol, bottomTotalLR);
	appendValueInTableCol(totalWeightCol, bottomTotalWeight);
	appendValueInTableCol(totalAmountCol, Math.round(bottomTotalAmount));
	appendValueInTableCol(totalQuantityCol, bottomTotalQuantity);
}

function setTotalGrandTotal(bottomTotalRow, bottomGrandTotalLR, bottomGrandTotalWeight, bottomGrandTotalAmount, bottomGrandTotalQuantity) {
	var bottomTotalTable			= createTable('bottomTotalTable', 'bottomTotalTable', '1', '100%');

	var detailsRowCol				= createColumnInRow(bottomTotalRow, 'bottomTotalRow', '', '', '', '', '');
	appendValueInTableCol(detailsRowCol, bottomTotalTable);

	var bottomTotalHeaderRow		= createRowInTable('', '', '');

	appendRowInTable('bottomTotalTable', bottomTotalHeaderRow);

	var forDetailsCol				= createColumnInRow(bottomTotalHeaderRow, '', '', '50px;', '', '', '');
	var totalLRCol					= createColumnInRow(bottomTotalHeaderRow, 'totalLRCol', '', '', 'right', '', '');
	var totalWeightCol				= createColumnInRow(bottomTotalHeaderRow, 'totalWeightCol', '', '', 'right', '', '');
	var totalAmountCol				= createColumnInRow(bottomTotalHeaderRow, 'totalAmountCol', '', '', 'right', '', '');
	var totalQuantityCol			= createColumnInRow(bottomTotalHeaderRow, 'totalQuantityCol', '', '', 'right', '', '');

	appendValueInTableCol(forDetailsCol, '<b>Grand Total</b>');
	appendValueInTableCol(totalLRCol, bottomGrandTotalLR);
	appendValueInTableCol(totalWeightCol, bottomGrandTotalWeight);
	appendValueInTableCol(totalAmountCol, Math.round(bottomGrandTotalAmount));
	appendValueInTableCol(totalQuantityCol, bottomGrandTotalQuantity);
}

function setRightSideTotalForDestWiseSubRegionSummary(createNewRow, key3, rightTotalPendingLR, rightTotalPendingWeight, rightTotalPendingAmount, rightTotalPendingQuantity, rightTotalArrivalLR, rightTotalArrivalWeight, rightTotalArrivalAmount, rightTotalArrivalQuantity) {
	var newTableForTotal			= createTable('newTable_Total_' + removeAllWhiteSpace(key3), '', '1', '100%');

	var totalRowCol		= createColumnInRow(createNewRow, 'detailsRow_Total_' + removeAllWhiteSpace(key3), '', '', '', '', '');
	appendValueInTableCol(totalRowCol, newTableForTotal);

	var rightTotalRow			= createRowInTable('', '', '');
	var rightTotalPendingRow	= createRowInTable('', '', '');
	
	if(TruckArrivalDetailsDisplay) {
		var rightTotalArrivalRow	= createRowInTable('', '', '');
		var rightTotalPendAndArrRow	= createRowInTable('', '', '');
	}
	
	appendRowInTable('newTable_Total_' + removeAllWhiteSpace(key3), rightTotalRow);
	appendRowInTable('newTable_Total_' + removeAllWhiteSpace(key3), rightTotalPendingRow);
	
	if(TruckArrivalDetailsDisplay) {
		appendRowInTable('newTable_Total_' + removeAllWhiteSpace(key3), rightTotalArrivalRow);
		appendRowInTable('newTable_Total_' + removeAllWhiteSpace(key3), rightTotalPendAndArrRow);
	}

	var forColumn						= createColumnInRow(rightTotalRow, '', '', '', '', '', '');
	var rightTotalLRCol					= createColumnInRow(rightTotalRow, '', '', '', 'center', '', '');
	var rightTotalWeightCol				= createColumnInRow(rightTotalRow, '', '', '', 'center', '', '');
	var rightTotalAmountCol				= createColumnInRow(rightTotalRow, '', '', '', 'center', '', '');
	var rightTotalQuantityCol			= createColumnInRow(rightTotalRow, '', '', '', 'center', '', '');

	var forPendingDispatchCol			= createColumnInRow(rightTotalPendingRow, '', '', '', '', '', '');
	var rightTotalPendingLRCol			= createColumnInRow(rightTotalPendingRow, '', '', '', 'right', '', '');
	var rightTotalPendingWeightCol		= createColumnInRow(rightTotalPendingRow, '', '', '', 'right', '', '');
	var rightTotalPendingAmountCol		= createColumnInRow(rightTotalPendingRow, '', '', '', 'right', '', '');
	var rightTotalPendingQuantityCol	= createColumnInRow(rightTotalPendingRow, '', '', '', 'right', '', '');

	if(TruckArrivalDetailsDisplay) {
		var forArrivalDetailsCol			= createColumnInRow(rightTotalArrivalRow, '', '', '', '', '', '');
		var rightTotalArrivalLRCol			= createColumnInRow(rightTotalArrivalRow, '', '', '', 'right', '', '');
		var rightTotalArrivalWeightCol		= createColumnInRow(rightTotalArrivalRow, '', '', '', 'right', '', '');
		var rightTotalArrivalAmountCol		= createColumnInRow(rightTotalArrivalRow, '', '', '', 'right', '', '');
		var rightTotalArrivalQuantityCol	= createColumnInRow(rightTotalArrivalRow, '', '', '', 'right', '', '');
		
		var forPendAndArrCol				= createColumnInRow(rightTotalPendAndArrRow, '', '', '', '', '', '');
		var rightTotalPendAndArrLRCol		= createColumnInRow(rightTotalPendAndArrRow, '', '', '', 'right', '', '');
		var rightTotalPendAndArrWeightCol	= createColumnInRow(rightTotalPendAndArrRow, '', '', '', 'right', '', '');
		var rightTotalPendAndArrAmountCol	= createColumnInRow(rightTotalPendAndArrRow, '', '', '', 'right', '', '');
		var rightTotalPendAndArrQuantityCol	= createColumnInRow(rightTotalPendAndArrRow, '', '', '', 'right', '', '');
	}
	
	appendValueInTableCol(forColumn, '');
	appendValueInTableCol(rightTotalLRCol, '<b>Total LR</b>');
	appendValueInTableCol(rightTotalWeightCol, '<b>Total Weight</b>');
	appendValueInTableCol(rightTotalAmountCol, '<b>Total Amount</b>');
	appendValueInTableCol(rightTotalQuantityCol, '<b>Total Articles</b>');

	appendValueInTableCol(forPendingDispatchCol, '<b>PD</b>');
	appendValueInTableCol(rightTotalPendingLRCol, rightTotalPendingLR);
	appendValueInTableCol(rightTotalPendingWeightCol, rightTotalPendingWeight);
	appendValueInTableCol(rightTotalPendingAmountCol, Math.round(rightTotalPendingAmount));
	appendValueInTableCol(rightTotalPendingQuantityCol, rightTotalPendingQuantity);

	if(TruckArrivalDetailsDisplay) {
		appendValueInTableCol(forArrivalDetailsCol, '<b>Arrival</b>');
		appendValueInTableCol(rightTotalArrivalLRCol, rightTotalArrivalLR);
		appendValueInTableCol(rightTotalArrivalWeightCol, rightTotalArrivalWeight);
		appendValueInTableCol(rightTotalArrivalAmountCol, Math.round(rightTotalArrivalAmount));
		appendValueInTableCol(rightTotalArrivalQuantityCol, rightTotalArrivalQuantity);
		
		appendValueInTableCol(forPendAndArrCol, '<b>Total</b>');
		appendValueInTableCol(rightTotalPendAndArrLRCol, rightTotalPendingLR + rightTotalArrivalLR);
		appendValueInTableCol(rightTotalPendAndArrWeightCol, rightTotalPendingWeight + rightTotalArrivalWeight);
		appendValueInTableCol(rightTotalPendAndArrAmountCol, Math.round(rightTotalPendingAmount) + Math.round(rightTotalArrivalAmount));
		appendValueInTableCol(rightTotalPendAndArrQuantityCol, rightTotalPendingQuantity + rightTotalArrivalQuantity);
	}
}

function checkBoxForSourceBranches(column, branchId) {
	var checkBoxObject		= new Object();
	
	checkBoxObject.type		= 'checkbox';
	checkBoxObject.name		= 'branch_' + branchId;
	checkBoxObject.id		= 'branch_' + branchId;
	checkBoxObject.value	= branchId;
	checkBoxObject.onclick	= 'calculateTotal()';
	
	createInput(column, checkBoxObject);
}

function checkBoxForBranches(subregionNameCol, key) {
	var checkBoxObject		= new Object();
	
	checkBoxObject.type		= 'checkbox';
	checkBoxObject.name		= 'subRegion_' + key.split('_')[1];
	checkBoxObject.id		= 'subRegion_' + key.split('_')[1];
	checkBoxObject.value	= key.split('_')[1];
	checkBoxObject.onclick	= 'calculateTotal()';
	
	createInput(subregionNameCol, checkBoxObject);
}

function checkBoxForSubregion(subregionNameCol, key) {
	var checkBoxObject		= new Object();
	
	checkBoxObject.type		= 'checkbox';
	checkBoxObject.name		= 'subRegion_' + key.split('_')[1];
	checkBoxObject.id		= 'subRegion_' + key.split('_')[1];
	checkBoxObject.value	= key.split('_')[1];
	checkBoxObject.onclick	= 'clicked(this);';
	
	createInput(subregionNameCol, checkBoxObject);
}

function checkBoxForSubRegionBranches(subBranchesCol, key, key3) {
	var checkBoxObject		= new Object();
	
	checkBoxObject.type		= 'checkbox';
	checkBoxObject.name		= 'subRegionBranches_' + key.split('_')[1];
	checkBoxObject.id		= 'subRegionBranches_' + key.split('_')[1];
	checkBoxObject.value	= key3.split('_')[1];
	checkBoxObject.onclick	= 'checkSubRegion(' + key.split('_')[1] + ')';
	
	createInput(subBranchesCol, checkBoxObject);
}

function checkSubRegion(id) {
	if(document.getElementById('subRegion_'+id).checked == false) {
		document.getElementById('subRegion_'+id).checked = true;
		calculateTotal();
	} else {
		calculateTotal();	}
}