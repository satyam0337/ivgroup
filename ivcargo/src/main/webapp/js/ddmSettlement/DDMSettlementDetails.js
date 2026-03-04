//Called in GenericDDMSettlement.js file
function displayDDMDetails(deliveryRunSheetLedger) {
	if(!deliveryRunSheetLedger || jQuery.isEmptyObject(deliveryRunSheetLedger))
		return;

	if(deliveryRunSheetLedger != undefined) {
		searchedDDMNumber 	= deliveryRunSheetLedger[0].ddmNumber
		
		for(i = 0; i < deliveryRunSheetLedger.length; i++) {
			tableRow					= createRowInTable(i, '');
			ddmNumberCol				= createColumnInRow(tableRow, 'DDMNumberLabelVal'+i, '', '', '', '', '');
			deliveryRunSheetLedgerIdCol	= createColumnInRow(tableRow, 'deliveryRunSheetLedgerId'+i, '', '', '', 'display:none;', '');
			vehicleNumberMasterIdCol	= createColumnInRow(tableRow, 'vehicleNumberMasterId'+i, '', '', '', 'display:none;', '');
			dateCol						= createColumnInRow(tableRow, 'DateLabelVal'+i, '', '', '', '', '');
			FromCol						= createColumnInRow(tableRow, 'FromLabelVal'+i, '', '', '', '', '');
			toCol						= createColumnInRow(tableRow, 'ToLabelVal'+i, '', '', '', '', '');
			TruckNumberCol				= createColumnInRow(tableRow, 'TruckNumberLabelVal'+i, '', '', '', '', '');
			DriverNameCol				= createColumnInRow(tableRow, 'DriverNameLabelVal'+i, '', '', '', '', '');
			
			if(isMultipleDDM) {
				SettleButtonCol				= createColumnInRow(tableRow, '', '', '', '', '', '');
			}
			
			appendValueInTableCol(ddmNumberCol, deliveryRunSheetLedger[i].ddmNumber);
			appendValueInTableCol(deliveryRunSheetLedgerIdCol, deliveryRunSheetLedger[i].deliveryRunSheetLedgerId);
			appendValueInTableCol(vehicleNumberMasterIdCol, deliveryRunSheetLedger[i].vehicleId);
			appendValueInTableCol(dateCol, deliveryRunSheetLedger[i].creationDateForUser);
			appendValueInTableCol(FromCol, deliveryRunSheetLedger[i].sourceBranch);
			appendValueInTableCol(toCol, deliveryRunSheetLedger[i].destinationBranch);
			appendValueInTableCol(TruckNumberCol, deliveryRunSheetLedger[i].vehicleNumber);
			appendValueInTableCol(DriverNameCol, deliveryRunSheetLedger[i].driverName);
			
			if(isMultipleDDM) {
				var createButtonForSettleAttr		= createButtonForSettle('Settle'+i,deliveryRunSheetLedger[i].deliveryRunSheetLedgerId,deliveryRunSheetLedger[i].vehicleId,deliveryRunSheetLedger[i].vehicleNumber);
				
				appendValueInTableCol(SettleButtonCol, createButtonForSettleAttr);
			}
			
			appendRowInTable('DDMSettlementDetailsTbl', tableRow);
		}
		
		if(!isMultipleDDM) {
			setValueToTextField('deliveryRunSheetLedgerId', deliveryRunSheetLedger[0].deliveryRunSheetLedgerId);
			setValueToTextField('vehicleNumberMasterId', deliveryRunSheetLedger[0].vehicleId);
			setValueToTextField('vehicleNumber', deliveryRunSheetLedger[0].vehicleNumber);
		}
	}
}

function resetDDMSettlementDetailsTbl() {
	$("#DDMSettlementDetailsTbl tbody tr").remove();
	$("#lrDetailsTableNew tbody tr").remove();
	$("#DDMSettlementDetailsTbl").find("tr:gt(0)").remove();
	$("#lrDetailsTableNew").find("tr").remove();
}

function createButtonForSettle(id,ledgerId,vehicleId,vehicleNumber) {
	var ddmSettlementButton		= new Object();

	ddmSettlementButton.onclick		= 'javascript:viewDdmDetails("'+ ledgerId +'","'+vehicleId+'","'+vehicleNumber+'")';
	ddmSettlementButton.html		= 'Get Details'; 
	ddmSettlementButton.class		= 'btn btn-info';
	ddmSettlementButton.id			= 'btn'+ledgerId;
	
	var ddmSettlementButtonAttr		= createButton($('#'+id),ddmSettlementButton);
	return ddmSettlementButtonAttr;
}

function viewDdmDetails(deliveryRunSheetLedgerId,vehicleId,vehicleNumber) {
	setValueToTextField('deliveryRunSheetLedgerId', deliveryRunSheetLedgerId);
	setValueToTextField('vehicleNumberMasterId', vehicleId);
	setValueToTextField('vehicleNumber', vehicleNumber);
	
	$('#DDMSettlementDetailsTbl tr').bind('click', function(e) {
	    var row = $(this); 
	   
	    if(!row.hasClass('highlight')) {
	    	 row.addClass('highlight').siblings().removeClass('highlight'); 	
	    }
	});
	
	removeTableData('lrDetailsTableNew');
	getDeliveryRunSheetSummary(deliveryRunSheetLedgerId);
	switchHtmlTagClass('showHideDDMDetailsButtonDiv', 'visibility-visible', 'visibility-hidden');
}

function showHideDDMDetailsDiv() {
	$("#DDMSettlementDetailsDiv").toggle(1000);
}

function showHideToPaySummary() {
	$("#settlementSummaryDiv").toggle(1000);
}