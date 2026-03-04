/**
 * 
 */

var executive					= null;
var Waybills					= null;
var crossingAgentBillClearance	= null;
var crossingAgentBill			= null;

function loadTransportSuccessPage() {
	var jsonObject		= new Object();
	
	jsonObject.isCrossingFlow	= getValueFromInputField('isCrossingFlow');
	jsonObject.dispatchLedgerId	= getValueFromInputField('dispatchLedgerId');
	jsonObject.type				= getValueFromInputField('type');
	
	var jsonStr = JSON.stringify(jsonObject);
	
	$.getJSON("TransportDispatchSuccessAjaxAction.do?pageId=3&eventId=15",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('error', iconForInfoMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
				} else{
					console.log(data);
					executive					= data.executive;
					Waybills					= data.Waybills;
					crossingAgentBillClearance	= data.crossingAgentBillClearance;
					crossingAgentBill			= data.crossingAgentBill;
					
					setCrossingAgentBillClearance();
					setPaymentModeSelection();
					setPaymentTypeSelection();
					setTotalAMount();
					setWayBillDetails();
				}
			});
}

function setCrossingAgentBillClearance() {
	if(crossingAgentBill == undefined) {
		changeDisplayProperty('showAdvancePaymentOpt', 'none');
	}
}

function setTotalAMount() {
	var advancePayment		= getValueFromInputField('advancePayment');
	
	if(advancePayment < 0) {
		setValueToTextField('totalAmount', -advancePayment);
	} else {
		setValueToTextField('totalAmount', advancePayment);
	}
}

function setWayBillDetails() {
	if(Waybills != undefined) {
		changeDisplayProperty('wayBillDetails', 'block');
		var totalDly		= 0.0;
		var totalBkg		= 0.0;
		
		for(var i = 0; i < Waybills.length; i++) {
			var wayBillNumber		= Waybills[i].wayBillNumber;
			var wayBillId			= Waybills[i].wayBillId;
			var consignorName		= Waybills[i].consignorName;
			var consigneeName		= Waybills[i].consigneeName;
			var wayBillType			= Waybills[i].wayBillType;
			var packageDetails		= Waybills[i].packageDetails;
			var bkgAmount			= Waybills[i].bkgAmount;
			var deliveryAmount		= Waybills[i].deliveryAmount;
			
			totalDly				+= deliveryAmount;
			totalBkg				+= bkgAmount;
			
			var srNO				= i + 1;
			
			var tableRow				= createRowInTable('', '', '');
			var srNoCol					= createColumnInRow(tableRow, '', 'text-center', '', '', '', '');
			var wayBillNumberCol		= createColumnInRow(tableRow, '', 'text-left', '', '', '', '');
			var consignorNameCol		= createColumnInRow(tableRow, '', 'text-left', '', '', '', '');
			var consigneeNameCol		= createColumnInRow(tableRow, '', 'text-left', '', '', '', '');
			var wayBillTypeCol			= createColumnInRow(tableRow, '', 'text-left', '', '', '', '');
			var packageDetailsCol		= createColumnInRow(tableRow, '', 'text-left', '', '', '', '');
			var bkgAmountCol			= createColumnInRow(tableRow, '', 'text-right', '', '', '', '');
			var deliveryAmountCol		= createColumnInRow(tableRow, '', 'text-right', '', '', '', '');
			var printButtonCol			= createColumnInRow(tableRow, '', 'text-center', '', '', '', '');
			
			appendValueInTableCol(srNoCol, srNO);
			
			var wayBillSearchFeild		= new Object();
			
			wayBillSearchFeild.href		= 'javascript:openWindowForView("' + wayBillId + '", "' + LR_SEARCH_TYPE_ID + '", 0)';
			wayBillSearchFeild.html		= wayBillNumber; 
			
			var wayBillSearchAttr		= createHyperLink(wayBillSearchFeild);
			
			appendValueInTableCol(wayBillNumberCol, wayBillSearchAttr);
			appendValueInTableCol(consignorNameCol, consignorName);
			appendValueInTableCol(consigneeNameCol, consigneeName);
			appendValueInTableCol(wayBillTypeCol, wayBillType);
			appendValueInTableCol(packageDetailsCol, packageDetails);
			appendValueInTableCol(bkgAmountCol, Math.round(bkgAmount));
			appendValueInTableCol(deliveryAmountCol, Math.round(deliveryAmount));
			
			createPrintButton(printButtonCol, wayBillId);
			
			appendRowInTable('reportData', tableRow);
		}
		
		setGrandTotal(totalBkg, totalDly);
	}
}

function setGrandTotal(totalBkg, totalDly) {
	
	var createRow		= createRowInTable('', 'bg-warning text-danger', '');
	
	var blankCol1		= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankCol2		= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankCol3		= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankCol4		= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var blankCol5		= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	var totalHeadingCol	= createColumnInRow(createRow, '', 'text-left', '', '', '', '');
	var totalBkgCol		= createColumnInRow(createRow, '', 'text-right', '', '', '', '');
	var totlaDlyCol		= createColumnInRow(createRow, '', 'text-right', '', '', '', '');
	var blankCol6		= createColumnInRow(createRow, '', 'text-center', '', '', '', '');
	
	appendValueInTableCol(blankCol1, '');
	appendValueInTableCol(blankCol2, '');
	appendValueInTableCol(blankCol3, '');
	appendValueInTableCol(blankCol4, '');
	appendValueInTableCol(blankCol5, '');
	appendValueInTableCol(totalHeadingCol, '<b>Total</b>');
	appendValueInTableCol(totalBkgCol, totalBkg);
	appendValueInTableCol(totlaDlyCol, totalDly);
	appendValueInTableCol(blankCol6, '');
	
	appendRowInTable('grandTotalRow', createRow);
}

function createPrintButton(printButtonCol, wayBillId) {
	var printButton			= new Object();
	
	printButton.type		= 'button';
	printButton.name		= wayBillId + '_Print';
	printButton.id			= wayBillId + '_Print';
	printButton.value		= 'CR Print';
	printButton.class		= 'btn btn-info';
	printButton.onclick		= 'printWindow("' + wayBillId + '")';
	
	createInput(printButtonCol, printButton);
}