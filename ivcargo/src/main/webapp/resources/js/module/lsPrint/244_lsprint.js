/**
* Ashish Tiwari 16/08/2016
**/
var printLsSummary = false;
function printBillSummary() {
	HideSaidToContainDialog();
	if(msg != 1){
	window.setTimeout(printAfterDelay, 1000);
	}
	
	if(printLsSummary){
		changeDisplayProperty('narrationPrint', 'none')
		changeDisplayProperty('noBalanceNarrationPrint', 'inline')
		changeDisplayProperty('advanceBalance', 'none')	
	}else {
		changeDisplayProperty('summaryPrint', 'none')	
		changeDisplayProperty('balance', 'none')	
	}
}

function printAfterDelay() {
	window.print();
	//window.close();
}

function ShowDialogPrintPaymentSummary() {
	
	if(crossingAgentBillClearance != null){
		if(crossingAgentBillClearance.status == 2){
			if(msg != 1){
				
			$("#LsSummaryOverlay").show();
				$("#LsSummaryPrintDialog").fadeIn(300);
				$('#cancLR').focus();
			}else {
				changeDisplayProperty('narrationPrint', 'none')
				changeDisplayProperty('noBalanceNarrationPrint', 'inline')
				changeDisplayProperty('advanceBalance', 'none')	
			}
		} else {
			printBillSummary();		
		}	
	} else {		
		printBillSummary();		
	}
	
	
}

function HideSaidToContainDialog(){
	$("#LsSummaryOverlay").hide();
	$("#LsSummaryPrintDialog").fadeOut(0);
}

function setLsSummary(obj) {
	if(obj.id == 'printLSSummary'){
		printLsSummary = true;
	}
	printBillSummary();
}