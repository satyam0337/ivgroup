var loadCreditor					= new $.Deferred();	//	addCreditor

var jsondata 						= null;
var executiveObj					= null;
var Executive						= null;
var configuration					= null;
var columnsCount 					= 0;
var billPaymentConfig				= null;
var isCheck 						= true;
var isCreditorCheck 				= true;
var noOfRow							= 1;
var totalTdsAmount					= 0;
var creditorLength					= 0;
var jsDataPanelObject 				= null;
var jsDataPanelArray				= null;
var jsDataPanelHM					= null;
var enterCount						= 0;
var showMessagePaymentTypeChange	= false;
var multipleClearSelection			= null;
var typeOfSelection					= null;
var allowChequeBouncePayment		= false;
var executive						= null;
var chequeBounceRequired			= false;
var discountInPercent				= 0;
var autoAppendBillsForPayment		= false;
var allowPartialBillsInMultipleClear= false;
var showSuppBillRowAfterBillDetails	= false;
let grandTotalAmount	= 0;

function loadDataForBillClearnce(creditorId, creditorName, isFromReport) {

	let jsonObject		= new Object();
	jsonObject.filter	= 1;
	let jsonStr 		= JSON.stringify(jsonObject);

	$.getJSON("BillClearanceAjaxAction.do?pageId=216&eventId=6",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					showMessage('info', iconForInfoMsg + ' ' + data.errorDescription); // show message to show system processing error massage on top of the window.
					changeDisplayProperty('bottom-border-boxshadow', 'none');
				} else{
					if(typeof createVideoLink != 'undefined' && $('#youtube_training_video_link').length == 0) createVideoLink(data);
					jsondata				= data;

					executiveObj				= jsondata.executive; // executive object
					Executive					= jsondata.executiveCon; // executive object
					configuration				= data.groupConfiguration;
					billPaymentConfig			= data.billPaymentConfig;
					allowChequeBouncePayment	= data.allowChequeBouncePayment;
					executive					= data.executive;
					chequeBounceRequired		= data.chequeBounceRequired;
					discountInPercent			= data.discountInPercent;
					
					$('#receivedAmountValue').focus();
					
					loadBillClearnce();

					if(isFromReport != null) {
						if(isFromReport) {
							createOption('CreditorId', creditorId, creditorName);
							findData(creditorId, isFromReport);
						}
					} else {
						changeDisplayProperty('bottom-border-boxshadow', 'none');
						setCreditor();
						showHideSelection();
					}
				}
			});
}

var count 					= 0; 
var balanceAmt 				= 0;
var grandReceivedAmount		= 0;
var grandTot 				= 0;
var creditorDataArray		= null;

function findData(creditorId, isFromReport) {
	showLayer();
	changeDisplayProperty('hideShowPannel', '');
	changeDisplayProperty('billClrTable', '');

	if(!isFromReport) {
		if(!validateToGetBillData()) {
			hideLayer();
			return false;
		}
	}

	let typeOfSelection		= SEARCH_BY_CREDITOR;//Creditor Party

	if(billPaymentConfig.billNumberWiseSelection)
		typeOfSelection		= $('#typeOfSelection').val();
	
	if(billPaymentConfig.isAllowCreditorOptionInMultipleClear && $("#multipleClearSelection").is(":visible")){
		multipleClearSelection = $('#multipleClearSelection').val();
		
		if(multipleClearSelection == SEARCH_BY_MULTIPLE_CLEAR_BILL_NO)
			typeOfSelection		= SEARCH_BY_BILL_NO;
		else if(multipleClearSelection == SEARCH_BY_MULTIPLE_CLEAR_CREDITOR)
			typeOfSelection		= SEARCH_BY_CREDITOR;
	}
	
	let jsonObject 				= new Object();
	jsonObject.filter			= 2;
	jsonObject.typeOfSelection	= typeOfSelection;
	
	if(isFromReport)
		jsonObject.CreditorId 	= creditorId;
	else
		jsonObject.CreditorId 	= $('#CreditorId').val();
	
	jsonObject.BillNumber		= $('#billNumber').val();
	jsonObject.BranchId			= $('#branchId').val();

	let jsonStr = JSON.stringify(jsonObject);
	$.getJSON("BillClearanceAjaxAction.do?pageId=216&eventId=6",
			{json:jsonStr}, function(data) {
				if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
					changeDisplayProperty('hideShowPannel', 'none');
					showMessage('info', iconForInfoMsg + ' ' + data.errorDescription);
					changeDisplayProperty('bottom-border-boxshadow', 'none');
					hideLayer();
				} else {
					let jsonArr						= data.billsJsonArray;
						creditorDataArray 			= data.billsJsonArray;
					autoAppendBillsForPayment		= data.autoAppendBillsForPayment;
					allowPartialBillsInMultipleClear= data.allowPartialBillsInMultipleClear;
					showSuppBillRowAfterBillDetails	= data.showSuppBillRowAfterBillDetails;
					
					changeDisplayProperty('bottom-border-boxshadow', 'block');
					showMessagePaymentTypeChange = data.showMessagePaymentTypeChange; 
					
					if(count > 0 ){
						let table = $('#billClrTable').DataTable();
						table.clear().draw();
						table.destroy();
						$('table#billClrTable tr#columnsCount').remove();
					}
					
					if(!billPaymentConfig.showCumulativeColumn)
						$('.commutativeTotal').remove();
					
					if(!billPaymentConfig.showCgstSgstIgstColumn)
						$('.taxes').remove();
					
					if(billPaymentConfig.replaceBalanceAmtColWithTotalAmt) {
						$('.balAmt').remove();
						$('.totalAmt').add();
					} else {
						$('.balAmt').add();
						$('.totalAmt').remove();
					}
					
					let tFoot 			= null;
					let totRow 			= null;
					let k				= 0;
					balanceAmt 			= 0;
					columnsCount 		= 0;
					grandTot			= 0;
					grandReceivedAmount	= 0;
					
					
					if(showSuppBillRowAfterBillDetails && !$(".headerAppend").exists()){	
						$('#billClrTable thead tr:first').append('<th class="headerAppend" style="text-align: center; vertical-align: middle;">Bill Type</th>');
						$('#billClrTable thead tr:first').append('<th class="headerAppend" style="text-align: center; vertical-align: middle;">Reference Bill Number</th>');
						$('#billClrTable thead tr:first').append('<th class="headerAppend" style="text-align: center; vertical-align: middle;">Supplementary Bill Number</th>');
						
						$('#billClrTable tfoot tr:first').append('<th class="headerAppend" style="text-align: center; vertical-align: middle;">Bill Type</th>');
						$('#billClrTable tfoot tr:first').append('<th class="headerAppend" style="text-align: center; vertical-align: middle;">Reference Bill Number</th>');
						$('#billClrTable tfoot tr:first').append('<th class="headerAppend" style="text-align: center; vertical-align: middle;">Supplementary Bill Number</th>');
					}
					
					let commutativeTotal = 0;
					let commutatTotalCol	= null;
					
					for(let key in jsonArr) {
						k = k+1;

						if (jsonArr.hasOwnProperty(key)) {
							let biils = jsonArr[key];
							commutativeTotal += biils.balAmount;
							
							let billRow					= createRowInTable('tr_' + biils.billId, '', '');
							let srNo 					= createColumnInRow(billRow ,'td_' + k, '', '5%', 'center', '', '');
							let chkBoxClrMultipleBill 	= createColumnInRow(billRow ,'td_' + biils.billId, '', '7%', 'center', '', '');
							let billNO 					= createColumnInRow(billRow ,'td_' + biils.billNumber, '', '10%', 'center', '', '');  
							let createionDate		 	= createColumnInRow(billRow ,'td_' + biils.creationDateTimeStampString, '', '10%', 'center', '', '');
							let subBranch 				= createColumnInRow(billRow ,'td_' + biils.branchName, '', '10%', 'center', '', '');
							let currStatus 				= createColumnInRow(billRow ,'td_' + biils.clearanceStatusName, '', '10%', 'center', '', '');
							let forCol 					= createColumnInRow(billRow ,'td_checkForCollection', '', '3%', 'center', '', '');
							let collPersn 				= createColumnInRow(billRow ,'td_' + biils.collectionPersonName, '', '10%', 'center', '', '');

							if(billPaymentConfig.replaceBalanceAmtColWithTotalAmt) {
								var totalAmtWithoutTax		= createColumnInRow(billRow ,'td_' + (biils.taxAmount).toFixed(2), 'taxes', '10%', 'center', '', '');
								var receivedAmountCol		= createColumnInRow(billRow ,'td_' + biils.grandTotal, '', '10%', 'center', '', '');

								if (billPaymentConfig.showCgstSgstIgstColumn) {
									var cgst					= createColumnInRow(billRow ,'td_' + biils.cgstTax, 'taxes', '10%', 'center', '', '');
									var sgst					= createColumnInRow(billRow ,'td_' + biils.sgstTax, 'taxes', '10%', 'center', '', '');
									var igst					= createColumnInRow(billRow ,'td_' + biils.igstTax, 'taxes', '10%', 'center', '', '');
								}
							} else {
								var balAmount				= createColumnInRow(billRow ,'td_' + biils.grandTotal, '', '10%', 'center', '', '');		
								var receivedAmountCol		= createColumnInRow(billRow ,'td_' + biils.grandTotal, '', '10%', 'center', '', '');
							
								if (billPaymentConfig.showCgstSgstIgstColumn) {
									var cgst					= createColumnInRow(billRow ,'td_' + biils.cgstTax, 'taxes', '10%', 'center', '', '');
									var sgst					= createColumnInRow(billRow ,'td_' + biils.sgstTax, 'taxes', '10%', 'center', '', '');
									var igst					= createColumnInRow(billRow ,'td_' + biils.igstTax, 'taxes', '10%', 'center', '', '');
									var totalAmtWithoutTax		= createColumnInRow(billRow ,'td_' + (biils.taxAmount).toFixed(2), 'taxes', '10%', 'center', '', '');
								}
							}

							let totalAmount				= createColumnInRow(billRow ,'td_' + biils.grandTotal, '', '10%', 'center', '', '');
							
							if(billPaymentConfig.showCumulativeColumn)
								commutatTotalCol		= createColumnInRow(billRow ,'td_' + commutativeTotal, 'commutativeTotal', '10%', 'center', '', '');
							
							let noOfDaysCol				= createColumnInRow(billRow ,'td_' + biils.noOfDays, '', '10%', 'center', '', '');

							if(showSuppBillRowAfterBillDetails) {
								var billTypeCol				= createColumnInRow(billRow ,'td_billType' , '', '10%', 'center', '', '');
								var refBillNoCol			= createColumnInRow(billRow ,'td_refBillNo', '', '10%', 'center', '', '');
								var suppBillNoCol			= createColumnInRow(billRow ,'td_refBillNo', '', '10%', 'center', '', '');
							}

							let receivedAmount			= Number(biils.grandTotal - biils.balAmount).toFixed(2);

							appendValueInTableCol(srNo, k);
							
							if(billPaymentConfig.isAllowCreditorOptionInMultipleClear && biils.status == BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID && $('#typeOfSelection').val() == SEARCH_BY_MULTIPLE_BILL){
								if(allowPartialBillsInMultipleClear)
									appendValueInTableCol(chkBoxClrMultipleBill, '<input align="right" name="chk_' + k + '" id="chk_' + k + '" type=checkbox class="checkBoxBillCls">');
								else
									appendValueInTableCol('');
							} else
								appendValueInTableCol(chkBoxClrMultipleBill, '<input align="right" name="chk_' + k + '" id="chk_' + k + '" type=checkbox class="checkBoxBillCls">');
							
							appendValueInTableCol(billNO, '<a href="javascript:viewBillSummary(' + biils.billId + ','+"'"+ biils.billNumber +"'"+ ',' + biils.status + ',' + "'" + biils.creditorName + "'" + ');">' + biils.billNumber + '</a>');
							appendValueInTableCol(billNO, '<input name="billnumber_' + k + '" id="billnumber_' + k + '" type="hidden" value="' + biils.billNumber + '"/>');
							appendValueInTableCol(billNO, '<input name="billno_' + k + '" id="billno_' + k + '" type="hidden" value="' + biils.billId + '"/>');
							appendValueInTableCol(billNO, '<input name="creditorId_' + k + '" id="creditorId_' + k + '" type="hidden" value="' + biils.creditorId + '"/>');
							appendValueInTableCol(billNO, '<input name="receivedAmtLimit_' + k + '" id="receivedAmtLimit_' + k + '" type="hidden" value="' + receivedAmount + '"/>');
							appendValueInTableCol(createionDate, biils.creationDateTimeStampString);
							appendValueInTableCol(subBranch, biils.branchName);
							appendValueInTableCol(currStatus, biils.clearanceStatusName);
	
							if(billPaymentConfig.isAllowCreditorOptionInMultipleClear && biils.status == BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID && $('#typeOfSelection').val() == SEARCH_BY_MULTIPLE_BILL){
								if(allowPartialBillsInMultipleClear)
									appendValueInTableCol(forCol, '<input align="right" name="checkForCollection" id="checkForCollection" type="checkbox" value=' + biils.billId + '/>');
								else
									appendValueInTableCol('');
							} else
								appendValueInTableCol(forCol, '<input align="right" name="checkForCollection" id="checkForCollection" type="checkbox" value=' + biils.billId + '/>');

							appendValueInTableCol(collPersn, biils.collectionPersonName);
							
							if(billPaymentConfig.replaceBalanceAmtColWithTotalAmt) {
								appendValueInTableCol(totalAmtWithoutTax, (biils.taxAmount).toFixed(2));
								appendValueInTableCol(receivedAmountCol, receivedAmount);
								
								if(billPaymentConfig.showCgstSgstIgstColumn) {
									appendValueInTableCol(cgst, biils.cgstTax);
									appendValueInTableCol(sgst, biils.sgstTax);
									appendValueInTableCol(igst, biils.igstTax);
								}	
							} else {
								appendValueInTableCol(balAmount, biils.balAmount);
								appendValueInTableCol(receivedAmountCol, receivedAmount);
								
								if(billPaymentConfig.showCgstSgstIgstColumn) {
									appendValueInTableCol(cgst, biils.cgstTax);
									appendValueInTableCol(sgst, biils.sgstTax);
									appendValueInTableCol(igst, biils.igstTax);
									appendValueInTableCol(totalAmtWithoutTax, (biils.taxAmount).toFixed(2));
								}								
							}
							
							appendValueInTableCol(totalAmount, biils.grandTotal);
							appendValueInTableCol(billNO, '<input name="branchId_' + k + '" id="branchId_' + k + '" type="hidden" value="' + biils.branchId + '"/>');
							
							if(commutatTotalCol != null)
								appendValueInTableCol(commutatTotalCol, commutativeTotal);
								
							appendValueInTableCol(noOfDaysCol, biils.noOfDays);
							appendValueInTableCol(billNO, '<input name="billCreationDate_' + k + '" id="billCreationDate_' + k + '" type="hidden" value="' + biils.creationDateTimeStampString + '"/>');
							
							if(showSuppBillRowAfterBillDetails) {
								appendValueInTableCol(billTypeCol, biils.billType);
								appendValueInTableCol(refBillNoCol, biils.referenceBillNumber);
								appendValueInTableCol(suppBillNoCol, biils.suppBillNumber);
							}

							appendRowInTable('billClrTable', billRow);
							balanceAmt 			+= Number(biils.balAmount);
							grandReceivedAmount = parseInt(grandReceivedAmount);
							receivedAmount      = parseInt(receivedAmount);
							grandReceivedAmount	+= receivedAmount;
							grandTotalAmount	+= biils.taxAmount;
							grandTot 			+= Number(biils.grandTotal);
						}
					}
					
					let commutTotal	= null;

					totRow 						= createRowInTable('columnsCount', '', '');
					let blanckCell1				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');	
					let blanckCell2				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');	
					let blanckCell3				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');	
					let blanckCell4				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');	
					let blanckCell5				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');	
					let blanckCell6				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');	
					let blanckCell7				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');	
					let blanckCell8				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
					
					if(billPaymentConfig.replaceBalanceAmtColWithTotalAmt) {
						var blanckCel23				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');	
						var receivedAnount 			= createColumnInRow(totRow , 'total_' + Number(columnsCount++), '', '', 'center', '', '');
				
						if (billPaymentConfig.showCgstSgstIgstColumn) {
							var blanckCel20				= createColumnInRow(totRow , 'td_', '', '', '', '', '');
							var blanckCel21				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
							var blanckCel22				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
						}
					} else {
						var balanceAnount 			= createColumnInRow(totRow , 'total_' + Number(columnsCount++), '', '', 'center', '', '');
						var receivedAnount 			= createColumnInRow(totRow , 'total_' + Number(columnsCount++), '', '', 'center', '', '');
						
						if (billPaymentConfig.showCgstSgstIgstColumn) {
							var blanckCel20				= createColumnInRow(totRow , 'td_', '', '', '', '', '');
							var blanckCel21				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
							var blanckCel22				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
							var blanckCel23				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
						}
					}
					
					let grndAmount	 			= createColumnInRow(totRow , 'total_' + Number(columnsCount++), '', '', 'center', '', '');
					
					if(billPaymentConfig.showCumulativeColumn)
						commutTotal	 			= createColumnInRow(totRow , 'total_' + Number(columnsCount++), 'commutativeTotal', '', 'center', '', '');
					
					let blanckCell9				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');

					if(showSuppBillRowAfterBillDetails) {
						var blanckCell10			= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
						var blanckCell11			= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
						var blanckCell12			= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
					}
					
					appendValueInTableCol(blanckCell1, '');
					appendValueInTableCol(blanckCell2, '');
					appendValueInTableCol(blanckCell3, '');
					appendValueInTableCol(blanckCell4, '');
					appendValueInTableCol(blanckCell5, '');
					appendValueInTableCol(blanckCell6, '');
					appendValueInTableCol(blanckCell7, '');
					appendValueInTableCol(blanckCell8, '<b>TOTAL</b>');
					
					if(billPaymentConfig.replaceBalanceAmtColWithTotalAmt) {
						appendValueInTableCol(blanckCel23, '<b>' + Math.round(grandTotalAmount) +'</b>');
						appendValueInTableCol(receivedAnount, grandReceivedAmount);
						
						if (billPaymentConfig.showCgstSgstIgstColumn) {
							appendValueInTableCol(blanckCel20, '');
							appendValueInTableCol(blanckCel21, '');
							appendValueInTableCol(blanckCel22, '');
						}
					} else {
						appendValueInTableCol(balanceAnount, balanceAmt);
						appendValueInTableCol(receivedAnount, grandReceivedAmount);
						
						if (billPaymentConfig.showCgstSgstIgstColumn) {
							appendValueInTableCol(blanckCel20, '');
							appendValueInTableCol(blanckCel21, '');
							appendValueInTableCol(blanckCel22, '');
							appendValueInTableCol(blanckCel23, '');
						}						
					}
					
					appendValueInTableCol(grndAmount, grandTot);
					
					if(commutTotal != null)
						appendValueInTableCol(commutTotal, '<b>' + commutativeTotal + '</b>');
					
					appendValueInTableCol(blanckCell9, '');
					
					if(showSuppBillRowAfterBillDetails) {
						appendValueInTableCol(blanckCell10, '')
						appendValueInTableCol(blanckCell11, '')
						appendValueInTableCol(blanckCell12, '')
					}

					tFoot = $('#tFoot').append(totRow);
					$('#billClrTable').append(tFoot);

					if(count == 0 ) {
						resetTable();

						count++;
					} else {
						var table = $('#billClrTable').DataTable();
						table.destroy();

						resetTable();
					}
					
					if(autoAppendBillsForPayment && $('#typeOfSelection').val() == 1 && multipleClearSelection == SEARCH_BY_MULTIPLE_CLEAR_CREDITOR){
						partialBillId	= 0;
						partialBillAmt	= 0;

						$('#billAmountInputField').removeClass('hide');
						$( "#amountToBeReceived" ).val('');

						$( "#amountToBeReceived" ).keypress(function(event) {
							if(event.keyCode == 13){
								appendBillsToMakePayment(balanceAmt)
							}
						});
					} else {
						$('#billAmountInputField').addClass('hide');
					}
					
					hideLayer();
				}
			});
}

function validate() {
	if(getValueFromInputField('CreditorId') == "0") {
		showMessage('error', creditorSelectErrMsg);
		changeDisplayProperty('hideShowPannel', 'none');
		return false;
	}
	
	return true;
}

function clearTable(){
	$('#hideShowPannel').hide();
	changeDisplayProperty('bottom-border-boxshadow', 'none');

	tableEl =  document.getElementById("billClrTable");

	if(tableEl.rows.length > 2){
		changeDisplayProperty('billClrTable', 'none');
		let table = $('#billClrTable').DataTable();
		table.clear().draw();
		$('table#billClrTable tr#columnsCount').remove();
	}
}

function resetTable() {

	$('#billClrTable').dataTable( {

		"bPaginate": false,
		"bInfo": true,
		/*"scrollY":        "300px",*/
		"scrollCollapse": true,
		"sDom": "frtiS",
		"bJQueryUI" : true,

		destroy: true,
	});

	changeDisplayProperty('billClrTable_filter', 'none');
//	Setup - add a text input to each footer cell
	$('#billClrTable tfoot th').each( function () {
		let title = $('#billClrTable thead th').eq( $(this).index() ).text();  
		$(this).html( '<input type="text" id="'+title+'" class="form-control" size="5px;" placeholder="'+title+'" />' ); 
	});

//	DataTable
	let table = $('#billClrTable').DataTable();
//	Apply the search
	table.columns().eq( 0 ).each( function ( colIdx ) {

		$( 'input', table.column( colIdx ).footer() ).on( 'keyup change', function () {

			table
			.column( colIdx )
			.search( this.value )
			.draw();

			sumAmount();
		} );
	});

}

function sumAmount(){

	let column = 8;

	for(let k=0; k < Number(columnsCount);k++){
		let total = 0;
		total =  calculateColumn(column++);
		document.getElementById('total_'+k).innerHTML = Number(total);
	}   
}

function calculateColumn(index)
{
	let tableEle = document.getElementById('billClrTable');
	let total = 0;
	for(let i=1;i<tableEle.rows.length-2;i++){
		if(tableEle.rows[i].cells[index]!= null && tableEle.rows[i].cells[index].innerHTML != 'undefined' ){
			if (!isNaN(tableEle.rows[i].cells[index].innerHTML)){
				total += parseInt(tableEle.rows[i].cells[index].innerHTML);
			}
		}
	}
	return total;

};

function setCreditor() {

	removeOption('CreditorId',null);

	let creditorDtls = jsondata.creditorDtls;

	if(creditorDtls != undefined) {
		createOption('CreditorId',0, '--Select Creditor--');

		if(!jQuery.isEmptyObject(creditorDtls)) {
			creditorLength	= creditorDtls.length;

			for(const element of creditorDtls) {
				createOption('CreditorId', element.corporateAccountId, element.name);
			}
		}
	}
}

function setAutocompleteForBranch() {
	$("#searchByBranch").autocomplete({
		source: "DestinationBranchAutoCompleteForAjaxAction.do?pageId=9&eventId=27&deliveryDestinationBy=0",
		minLength: 2,
		delay: 10,
		autoFocus: true,
		select: function(event, ui) {
			if(ui.item.id != 0) {
				let destData = (ui.item.id).split("_");

				getDestination(ui.item.id);
			}
		},
		response: function(event, ui) {
			setLogoutIfEmpty(ui);
		}
	});
}

//set branch and city id from auto complete. work on onselect of autocomplete
function getDestination(branchId) {
	$('#branchId').val(parseInt(branchId));
}

function loadBillClearnce() {

	if(billPaymentConfig.showReceivedAmountFeild) {
		$("#billSettlementEntryFeild").load( "/ivcargo/jsp/MakePayment/includes/MakePaymentFeild.html", function() {
			$("#makePaymentPannel").hide();
			$("#slectAllChkBox").hide();
		});
	}
	
	if(billPaymentConfig.billNumberWiseSelection) {
		$("#BillNumberSelectionPannel").load( "/ivcargo/jsp/MakePayment/BillPayment/includes/BillNumberSelection.html", function() {
			setAutocompleteForBranch();
		});
		
		switchHtmlTagClass('CreditorPartySelectionPannel', 'hide', 'show');
	} else {
		switchHtmlTagClass('CreditorPartySelectionPannel', 'show', 'hide');
	}
}

function selectAllBill(param){
	let tab 	= document.getElementById('billClrTable');
	let count 	= parseFloat(tab.rows.length);

	let row;

	let typeOfSelection		= $('#typeOfSelection').val();
	
	if(typeOfSelection == SEARCH_BY_MULTIPLE_BILL) {
		if(param) {
			for (row =0; row <= count-2; row++) {
				if(tab.rows[row].cells[1].children[0] != undefined)
					tab.rows[row].cells[1].children[0].checked = true;
			}
		} else {
			for (row = 1; row <= count-2; row++) {
				if(tab.rows[row].cells[1].children[0] != undefined)
					tab.rows[row].cells[1].children[0].checked = false;
			}
		}
	} else if(param) {
		for (row =0; row < count-2; row++){
			tab.rows[row].cells[1].children[0].checked = true;
		}
	} else {
		for (row = 1; row < count-2; row++){
			tab.rows[row].cells[1].children[0].checked = false;
		}
	}
}

function showHideSelection() {
    typeOfSelection			= SEARCH_BY_CREDITOR;//Creditor Party
	
	if(billPaymentConfig.billNumberWiseSelection) {
		typeOfSelection	= $('#typeOfSelection').val();
	}

	if(typeOfSelection == 0) {
		switchHtmlTagClass('multipleClearSelectionDropBox', 'hide', 'show');
		switchHtmlTagClass('billNoSelection', 'hide', 'show');
		switchHtmlTagClass('CreditorPartySelectionPannel', 'hide', 'show');
		$('#CreditorId').val(0);
		resetData();
	} else if(typeOfSelection == SEARCH_BY_MULTIPLE_BILL) {
		if(billPaymentConfig.isAllowCreditorOptionInMultipleClear) {
			switchHtmlTagClass('multipleClearSelectionDropBox', 'show', 'hide');
		} else {
			switchHtmlTagClass('multipleClearSelectionDropBox', 'hide', 'show');
			switchHtmlTagClass('billNoSelection', 'show', 'hide');
			switchHtmlTagClass('CreditorPartySelectionPannel', 'hide', 'show');
			switchHtmlTagClass('add', 'hide', 'show');
			$('#CreditorId').val(0);
			initialiseFocus();
		}
	} else if(typeOfSelection == SEARCH_BY_CREDITOR) {
		switchHtmlTagClass('multipleClearSelectionDropBox', 'hide', 'show');
		
		if(creditorLength > 0) {
			switchHtmlTagClass('CreditorPartySelectionPannel', 'show', 'hide');
			switchHtmlTagClass('add', 'show', 'hide');
		} else {
			$('#typeOfSelection').val(0);
			showMessage('info', iconForInfoMsg + ' ' + 'Creditor Party Not Found !');
			switchHtmlTagClass('add', 'hide', 'show');
		}

		switchHtmlTagClass('billNoSelection', 'hide', 'show');
		resetData();
	} else if(typeOfSelection == SEARCH_BY_BILL_NO) {
		switchHtmlTagClass('multipleClearSelectionDropBox', 'hide', 'show');
		switchHtmlTagClass('billNoSelection', 'show', 'hide');
		switchHtmlTagClass('CreditorPartySelectionPannel', 'hide', 'show');
		switchHtmlTagClass('add', 'show', 'hide');
		$('#CreditorId').val(0);
		initialiseFocus();
	} else {
		switchHtmlTagClass('billNoSelection', 'hide', 'show');
		switchHtmlTagClass('CreditorPartySelectionPannel', 'hide', 'show');
		switchHtmlTagClass('add', 'show', 'hide');
		resetData();
	}

	refreshAndHidePartOfPage('bottom-border-boxshadow', 'hideAndRefresh');
	
	if(!billPaymentConfig.showCumulativeColumn)
		$('.commutativeTotal').remove();

	isCheck 			= true;
	isCreditorCheck 	= true;
}

function showHideSelectionForMultipleClear(){
	multipleClearSelection = $('#multipleClearSelection').val();
	if(multipleClearSelection == 0){
		switchHtmlTagClass('billNoSelection', 'hide', 'show');
		switchHtmlTagClass('CreditorPartySelectionPannel', 'hide', 'show');
		$('#CreditorId').val(0);
		resetData();
	}else if(multipleClearSelection == SEARCH_BY_MULTIPLE_CLEAR_BILL_NO){
		typeOfSelection		= SEARCH_BY_BILL_NO;
		switchHtmlTagClass('billNoSelection', 'show', 'hide');
		switchHtmlTagClass('CreditorPartySelectionPannel', 'hide', 'show');
		switchHtmlTagClass('add', 'hide', 'show');
		$('#CreditorId').val(0);
		initialiseFocus();
	}else if(multipleClearSelection == SEARCH_BY_MULTIPLE_CLEAR_CREDITOR){
		typeOfSelection		= SEARCH_BY_CREDITOR;
		if(creditorLength > 0) {
			switchHtmlTagClass('billNoSelection', 'hide', 'show');
			switchHtmlTagClass('CreditorPartySelectionPannel', 'show', 'hide');
			switchHtmlTagClass('add', 'show', 'hide');
		} else {
			$('#multipleClearSelection').val(0);
			showMessage('info', iconForInfoMsg + ' ' + 'Creditor Party Not Found !');
			switchHtmlTagClass('add', 'hide', 'show');
		}

		switchHtmlTagClass('billNoSelection', 'hide', 'show');
		resetData();
	}

}
function resetData() {
	$('#branchId').val(0);
	$('#searchByBranch').val('');
	$('#billNumber').val('');
}

function resetDestinationPointData() {
	$('#branchId').val(0);
}

function searchSingleBill(event){
	if(event.which){ // Netscape/Firefox/Opera
		let keycode 	= event.which;
		let tbl  		= document.getElementById('billClrTable');

		let rowCount 	= 0;

		if(tbl.rows != undefined) {
			rowCount 	= tbl.rows.length;
		}

		if(keycode == 13) {
			let billNumber	= $('#billNumber').val().trim();
			let branchId	= $('#branchId').val();

			if(branchId > 0) {
				if(billNumber.length > 0){ 
					showLayer();

					changeDisplayProperty('hideShowPannel', '');
					changeDisplayProperty('billClrTable', '');

					if(!validateToGetBillData()) {
						hideLayer();
						return false;
					}

					let typeOfSelection		= 3;

					if(billPaymentConfig.billNumberWiseSelection)
						typeOfSelection		= $('#typeOfSelection').val();
					
					if(billPaymentConfig.isAllowCreditorOptionInMultipleClear && $("#multipleClearSelection").is(":visible")){
						multipleClearSelection = $('#multipleClearSelection').val();
						
						if(multipleClearSelection == SEARCH_BY_MULTIPLE_CLEAR_BILL_NO)
							typeOfSelection		= SEARCH_BY_BILL_NO;
						else if(multipleClearSelection == SEARCH_BY_MULTIPLE_CLEAR_CREDITOR)
							typeOfSelection		= SEARCH_BY_CREDITOR;
					}

					let jsonObject 				= new Object();
					jsonObject.filter			= 2;
					jsonObject.typeOfSelection	= typeOfSelection;
					jsonObject.CreditorId 		= $('#CreditorId').val();
					jsonObject.BillNumber		= $('#billNumber').val();
					jsonObject.BranchId			= $('#branchId').val();
					
					//Check if already added
					for (let i = 1; i < rowCount; i++) {
						let addedBillNo = null;

						if(tbl.rows[i].cells[2] != undefined) {
							addedBillNo = tbl.rows[i].cells[2].innerHTML.split('<')[0];
						}

						if(addedBillNo == billNumber) {
							showMessage('info', billNumberAlreadyAddedInfoMsg(billNumber));
							hideLayer();
							return;
						} else {
							hideAllMessages();
						};
					}
					
					let commutativeTotal	= 0;

					let jsonStr = JSON.stringify(jsonObject);

					$.getJSON("BillClearanceAjaxAction.do?pageId=216&eventId=6",
							{json:jsonStr}, function(data) {			
								if (!data || jQuery.isEmptyObject(data) || data.errorDescription) {
									changeDisplayProperty('hideShowPannel', 'none');
									showMessage('info', iconForInfoMsg + ' ' + data.errorDescription);
									changeDisplayProperty('bottom-border-boxshadow', 'none');
									hideLayer();
								} else {
									let jsonArr =  data.billsJsonArray;
									showSuppBillRowAfterBillDetails	= data.showSuppBillRowAfterBillDetails;
									
									if(showSuppBillRowAfterBillDetails && rowCount == 2 && !$(".headerAppend").exists()){
										$('#billClrTable thead tr:first').append('<th class="headerAppend" style="text-align: center; vertical-align: middle;">Bill Type</th>');
										$('#billClrTable thead tr:first').append('<th class="headerAppend" style="text-align: center; vertical-align: middle;">Reference Bill Number</th>');
										$('#billClrTable thead tr:first').append('<th class="headerAppend" style="text-align: center; vertical-align: middle;">Supplementary Bill Number</th>');
										
										$('#billClrTable tfoot tr:first').append('<th class="headerAppend" style="text-align: center; vertical-align: middle;">Bill Type</th>');
										$('#billClrTable tfoot tr:first').append('<th class="headerAppend" style="text-align: center; vertical-align: middle;">Reference Bill Number</th>');
										$('#billClrTable tfoot tr:first').append('<th class="headerAppend" style="text-align: center; vertical-align: middle;">Supplementary Bill Number</th>');
									}

									changeDisplayProperty('bottom-border-boxshadow', 'block');
									
									if(!billPaymentConfig.showCumulativeColumn)
										$('.commutativeTotal').remove();
									
									removeTableRows('billClrTable', 'tfoot');
									
									if (billPaymentConfig.replaceBalanceAmtColWithTotalAmt) {
										$('.balAmt').remove();
										$('.totalAmt').add();
									} else {
										$('.balAmt').add();
										$('.totalAmt').remove();
									}

									let tFoot 		= null;
									let totRow 		= null;
									columnsCount 	= 0;
									let statusName	= null;
									let isDifferentBranch = true;
									let isDifferentParty  = true;

									for(let key in jsonArr){

										isDifferentBranch = true;
										isDifferentParty  = true;
										
										if (jsonArr.hasOwnProperty(key)) {
											let biils = jsonArr[key];

											if(biils.status == BILL_CLEARANCE_STATUS_DUE_PAYMENT_ID) {
												statusName	= BILL_CLEARANCE_STATUS_DUE_PAYMENT_NAME;

												if(isCheck) {
													$('#branchIdForCheck').val(biils.branchId);
													isCheck 		= false;
												}

												if(isCreditorCheck) {
													$('#creditorIdForCheck').val(biils.creditorId);
													isCreditorCheck = false;
												}
												
												if($('#tr_'+biils.billId).exists()){
													showMessage('info',"Bill Already Added !");
													hideLayer();
													return false;
												}

												if(!billPaymentConfig.allowDifferentBranchPayment)
													isDifferentBranch = $('#branchIdForCheck').val() != biils.branchId;
												else
													isDifferentBranch = false;
												
												if(!billPaymentConfig.allowDifferentPartyPayment)
													isDifferentParty = $('#creditorIdForCheck').val() != biils.creditorId;
												else
													isDifferentParty = false;
													
												let commutatTotalCol	= null;

												if(!isDifferentBranch) {
													if(!isDifferentParty) {
														commutativeTotal = biils.balAmount;
													
														let billRow					= createRowInTable('tr_' + biils.billId, '', '');
														let srNo 					= createColumnInRow(billRow ,'td_' + noOfRow, '', '5%', 'center', '', '');
														let chkBoxClrMultipleBill 	= createColumnInRow(billRow ,'td_' + biils.billId, '', '7%', 'center', '', '');
														let billNO 					= createColumnInRow(billRow ,'td_' + biils.billNumber, '', '10%', 'center', '', '');  
														let createionDate		 	= createColumnInRow(billRow ,'td_' + biils.creationDateTimeStampString, '', '10%', 'center', '', '');
														let subBranch 				= createColumnInRow(billRow ,'td_' + biils.branchName, '', '10%', 'center', '', '');
														let currStatus 				= createColumnInRow(billRow ,'td_' + biils.clearanceStatusName, '', '10%', 'center', '', '');
														let forCol 					= createColumnInRow(billRow ,'td_checkForCollection', '', '3%', 'center', '', '');
														let collPersn 				= createColumnInRow(billRow ,'td_' + biils.collectionPersonName, '', '10%', 'center', '', '');
														
														if(billPaymentConfig.replaceBalanceAmtColWithTotalAmt) {
															var totalAmtWithoutTax		= createColumnInRow(billRow ,'td_' + biils.noOfDays, 'taxes', '10%', 'center', '', '');
															var receivedAmountCol		= createColumnInRow(billRow ,'td_' + biils.grandTotal, '', '10%', 'center', '', '');
														
															if (billPaymentConfig.showCgstSgstIgstColumn) {
																var cgst					= createColumnInRow(billRow ,'td_' + biils.noOfDays, 'taxes', '10%', 'center', '', '');
																var sgst					= createColumnInRow(billRow ,'td_' + biils.noOfDays, 'taxes', '10%', 'center', '', '');
																var igst					= createColumnInRow(billRow ,'td_' + biils.noOfDays, 'taxes', '10%', 'center', '', '');
															}
														} else {
															var balAmount				= createColumnInRow(billRow ,'td_' + biils.grandTotal, '', '10%', 'center', '', '');		
															var receivedAmountCol		= createColumnInRow(billRow ,'td_' + biils.grandTotal, '', '10%', 'center', '', '');
														
															if (billPaymentConfig.showCgstSgstIgstColumn) {
																var cgst					= createColumnInRow(billRow ,'td_' + biils.noOfDays, 'taxes', '10%', 'center', '', '');
																var sgst					= createColumnInRow(billRow ,'td_' + biils.noOfDays, 'taxes', '10%', 'center', '', '');
																var igst					= createColumnInRow(billRow ,'td_' + biils.noOfDays, 'taxes', '10%', 'center', '', '');
																var totalAmtWithoutTax		= createColumnInRow(billRow ,'td_' + biils.noOfDays, 'taxes', '10%', 'center', '', '');
															}
														}

														let totalAmount				= createColumnInRow(billRow ,'td_' + biils.grandTotal, '', '10%', 'center', '', '');
														
														if(billPaymentConfig.showCumulativeColumn)
															commutatTotalCol		= createColumnInRow(billRow ,'td_' + commutativeTotal, 'commutativeTotal', '10%', 'center', '', '');
														
														let noOfDaysCol				= createColumnInRow(billRow ,'td_' + biils.noOfDays, '', '10%', 'center', '', '');
														
														if(showSuppBillRowAfterBillDetails){
															var billTypeCol				= createColumnInRow(billRow ,'td_' + biils.billType , '', '10%', 'center', '', '');
															var refBillNoCol			= createColumnInRow(billRow ,'td_' + biils.referenceBillNumber, '', '10%', 'center', '', '');
															var suppBillNoCol			= createColumnInRow(billRow ,'td_' + biils.referenceBillNumber, '', '10%', 'center', '', '');
														}
														
														let receivedAmount			= biils.grandTotal + biils.additionalCharge + biils.incomeAmount - biils.balAmount;

														appendValueInTableCol(srNo, noOfRow);
														appendValueInTableCol(chkBoxClrMultipleBill, '<input align="right" name="chk_' + noOfRow + '" id="chk_' + noOfRow + '" type=checkbox class="checkBoxBillCls">');
														appendValueInTableCol(billNO, '<a href="javascript:viewBillSummary(' + biils.billId + ','+"'"+ biils.billNumber +"'"+ ',' + biils.status + ',' + "'" + biils.creditorName + "'" + ');">' + biils.billNumber + '</a>');
														appendValueInTableCol(billNO, '<input name="billnumber_' + k + '" id="billnumber_' + k + '" type="hidden" value="' + biils.billNumber + '"/>');
														appendValueInTableCol(billNO, '<input name="billno_' + noOfRow + '" id="billno_' + noOfRow + '" type="hidden" value="' + biils.billId + '"/>');
														appendValueInTableCol(billNO, '<input name="creditorId_' + noOfRow + '" id="creditorId_' + noOfRow + '" type="hidden" value="' + biils.creditorId + '"/>');
														appendValueInTableCol(billNO, '<input name="receivedAmtLimit_' + noOfRow + '" id="receivedAmtLimit_' + noOfRow + '" type="hidden" value="' + receivedAmount + '"/>');
														appendValueInTableCol(createionDate, biils.creationDateTimeStampString);
														appendValueInTableCol(subBranch, biils.branchName);
														appendValueInTableCol(currStatus, biils.clearanceStatusName);
														appendValueInTableCol(forCol, '<input align="right" name="checkForCollection" id="checkForCollection" type="checkbox" value=' + biils.billId + '/>');
														appendValueInTableCol(collPersn, biils.collectionPersonName);
														
														if(billPaymentConfig.replaceBalanceAmtColWithTotalAmt) {
															appendValueInTableCol(totalAmtWithoutTax, (biils.taxAmount).toFixed(2));
															appendValueInTableCol(receivedAmountCol, receivedAmount);
															
															if(billPaymentConfig.showCgstSgstIgstColumn) {
																appendValueInTableCol(cgst, biils.cgstTax);
																appendValueInTableCol(sgst, biils.sgstTax);
																appendValueInTableCol(igst, biils.igstTax);
															}
														} else {
															appendValueInTableCol(balAmount, biils.balAmount);
															appendValueInTableCol(receivedAmountCol, receivedAmount);
															
															if(billPaymentConfig.showCgstSgstIgstColumn) {
																appendValueInTableCol(cgst, biils.cgstTax);
																appendValueInTableCol(sgst, biils.sgstTax);
																appendValueInTableCol(igst, biils.igstTax);
																appendValueInTableCol(totalAmtWithoutTax, (biils.taxAmount).toFixed(2));
															}
														}
														
														appendValueInTableCol(totalAmount, biils.grandTotal + biils.additionalCharge + biils.incomeAmount);
														appendValueInTableCol(billNO, '<input name="branchId_' + noOfRow + '" id="branchId_' + noOfRow + '" type="hidden" value="' + biils.branchId + '"/>');
														
														if(commutatTotalCol != null)
															appendValueInTableCol(commutatTotalCol, commutativeTotal);
														
														appendValueInTableCol(noOfDaysCol, biils.noOfDays);
														
														appendValueInTableCol(billNO, '<input name="billCreationDate_' + noOfRow + '" id="billCreationDate_' + noOfRow + '" type="hidden" value="' + biils.creationDateTimeStampString + '"/>');
														
														if(showSuppBillRowAfterBillDetails) {
															appendValueInTableCol(billTypeCol, biils.billType);
															appendValueInTableCol(refBillNoCol, biils.referenceBillNumber);
															appendValueInTableCol(suppBillNoCol, biils.suppBillNumber);
														}
														
														appendRowInTable('billClrTable', billRow);
														
														balanceAmt 			+= Number(biils.balAmount);
														grandReceivedAmount	+= receivedAmount;
														grandTotalAmount  	+= biils.taxAmount;
														grandTot 			+= Number(biils.grandTotal + biils.additionalCharge + biils.incomeAmount);

														noOfRow++;
													} else {
														showMessage('error',"Please Enter Bill Number Of Same TBB Party !");
													}
												} else {
													showMessage('error',"Please Enter Bill Number Of Same Branch !");
												}
												
											} else {
												alert('Please Enter Bill Number Of Due Payment !');
											}
										}
									}
									
									commutTotal	= null;

									totRow 						= createRowInTable('columnsCount', '', '');
									let blanckCell1				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');	
									let blanckCell2				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');	
									let blanckCell3				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');	
									let blanckCell4				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');	
									let blanckCell5				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');	
									let blanckCell6				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');	
									let blanckCell7				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');	
									let blanckCell8				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
									
									if(billPaymentConfig.replaceBalanceAmtColWithTotalAmt) {
										var blanckCel23				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
										var receivedAnount 			= createColumnInRow(totRow , 'total_' + Number(columnsCount++), '', '', 'center', '', '');
										
										if (billPaymentConfig.showCgstSgstIgstColumn) {
											var blanckCel20				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
											var blanckCel21				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
											var blanckCel22				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
										}
									} else {
										var balanceAnount 			= createColumnInRow(totRow , 'total_' + Number(columnsCount++), '', '', 'center', '', '');
										var receivedAnount 			= createColumnInRow(totRow , 'total_' + Number(columnsCount++), '', '', 'center', '', '');
										
										if (billPaymentConfig.showCgstSgstIgstColumn) {
											var blanckCel20				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
											var blanckCel21				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
											var blanckCel22				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
											var blanckCel23				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
										}		
									}			
															
									let grndAmount	 			= createColumnInRow(totRow , 'total_' + Number(columnsCount++), '', '', 'center', '', '');
									
									if(billPaymentConfig.showCumulativeColumn)
										commutTotal	 			= createColumnInRow(totRow , 'total_' + Number(columnsCount++), '', '', 'center', '', '');
									
									let blanckCell9				= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
								
									if(showSuppBillRowAfterBillDetails){
										var blanckCell10			= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
										var blanckCell11			= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
										var blanckCell12			= createColumnInRow(totRow , 'td_', '', '', 'center', '', '');
									}

									appendValueInTableCol(blanckCell1, '');
									appendValueInTableCol(blanckCell2, '');
									appendValueInTableCol(blanckCell3, '');
									appendValueInTableCol(blanckCell4, '');
									appendValueInTableCol(blanckCell5, '');
									appendValueInTableCol(blanckCell6, '');
									appendValueInTableCol(blanckCell7, '');
									appendValueInTableCol(blanckCell8, '<b>TOTAL</b>');
									
									if(billPaymentConfig.replaceBalanceAmtColWithTotalAmt) {
										appendValueInTableCol(blanckCel23, '<b>' + Math.round(grandTotalAmount) +'</b>');
										appendValueInTableCol(receivedAnount, '<b>' + grandReceivedAmount + '</b>');
										
										if (billPaymentConfig.showCgstSgstIgstColumn) {
											appendValueInTableCol(blanckCel20, '');
											appendValueInTableCol(blanckCel21, '');
											appendValueInTableCol(blanckCel22, '');
										}
									} else {
										appendValueInTableCol(balanceAnount, '<b>' + balanceAmt + '</b>');
										appendValueInTableCol(receivedAnount, '<b>' + grandReceivedAmount + '</b>');
										
										if (billPaymentConfig.showCgstSgstIgstColumn) {
											appendValueInTableCol(blanckCel20, '');
											appendValueInTableCol(blanckCel21, '');
											appendValueInTableCol(blanckCel22, '');
											appendValueInTableCol(blanckCel23, '');
										}
									}
									
									appendValueInTableCol(grndAmount, '<b>' + grandTot + '</b>');
									
									if(commutTotal != null)
										appendValueInTableCol(commutTotal, '<b>' + commutativeTotal + '</b>');
										
									appendValueInTableCol(blanckCell9, '');
									
									if(showSuppBillRowAfterBillDetails){
										appendValueInTableCol(blanckCell10, '');
										appendValueInTableCol(blanckCell11, '');
										appendValueInTableCol(blanckCell12, '');
									}

									tFoot = $('#tFoot').append(totRow);
									$('#billClrTable').append(tFoot);

									$('#billNumber').val('');
									$('#billNumber').focus();

									hideLayer();
								}
							});
				
					commutativeTotal = 0;
					$('#billNumber').val('');
					$('#billNumber').focus();
				}
			}
		}
	}
}

function viewBillSummary(billId, billNo, billStatusId, creditorName) {
	window.open('viewBillSummary.do?pageId=216&eventId=4&billId='+billId+'&billNo='+billNo+'&billStatusId='+billStatusId+'&creditorName='+creditorName,'mywin','left=20,top=20,width=700,height=500,toolbar=1,resizable=1,scrollbars=1');
}

function checkEventforProcessBillSettlement(event) {
	let key	= getKeyCode(event);
	
	if(!validateInputTextFeild(1, 'receivedAmountValue', 'receivedAmountValue', 'error', amountEnterErrMsg)) {
		return false;
	}
	
	if (key == 8 || key == 46 ) {
		return;
	}

	if (key == 13) {
		if (enterCount == 0) {
			clearBillPayment();
			enterCount++;
		}
	} else {
		enterCount	= 0;
	}
}

function clearBillPayment() {
	let diff 	= 0;
	let k 		= 0;
	let receivedBillAmount 	= $('#receivedAmountValue').val();
	
	if(receivedBillAmount > balanceAmt){
		showMessage('info', billAmountExceedInfoMsg(balanceAmt));
		$('#receivedAmountValue').val('');
	} else {
		for(let key in creditorDataArray) {
			k 					= k+1;
			jsDataPanelObject 	= new Object();
			
			if (creditorDataArray.hasOwnProperty(key)) {
				let biils 			= creditorDataArray[key];
				let balanceAmount 	= biils.balAmount;
			
				if(receivedBillAmount > 0) {
					diff = receivedBillAmount - balanceAmount;
					
					checkedUnchecked("chk_" + k , 'true');
					receivedBillAmount = diff;
				}
			}
		}
		openPaymentPannel();
	}
}

function setJsDataPanelHM() {
	let diff 		= 0;
	let k 			= 0;
	jsDataPanelHM 	= new Object();
	
	let receivedBillAmount 	= $('#receivedAmountValue').val();
	
	for(let key in creditorDataArray) {
		k 					= k+1;
		jsDataPanelObject 	= new Object();
		
		if (creditorDataArray.hasOwnProperty(key)) {
			let biils 			= creditorDataArray[key];
			let balanceAmount 	= biils.balAmount;
		
			if(receivedBillAmount > 0) {
				diff = receivedBillAmount - balanceAmount;
				
				if(diff >= 0) {
					jsDataPanelObject.BillId 			= biils.billId;
					jsDataPanelObject.ReceivedAmount 	= biils.balAmount;
					jsDataPanelObject.BalanceAmount 	= 0;
					jsDataPanelObject.Status 			= BILL_CLEARANCE_STATUS_CLEAR_PAYMENT_ID;
					
					jsDataPanelHM[biils.billId]	 		= jsDataPanelObject;
				} else {
					jsDataPanelObject.BillId 			= biils.billId;
					jsDataPanelObject.ReceivedAmount 	= receivedBillAmount;
					jsDataPanelObject.BalanceAmount 	= biils.balAmount-receivedBillAmount;
					jsDataPanelObject.Status 			= BILL_CLEARANCE_STATUS_PARTIAL_PAYMENT_ID;
					
					jsDataPanelHM[biils.billId] 		= jsDataPanelObject;
				}
				
				receivedBillAmount = diff;
			}
		}
	}
}

function resetCheckBoxDetails(){
	let k 		= 0;
	for(let key in creditorDataArray){
		k 					= k+1;
		checkedUnchecked("chk_" + k , 'false');
		jsDataPanelHM = null;
	}
	$(".checkBoxBillCls").prop("disabled",false);
}

function setResetUiElement(){
	let k 		= 0;
	let receivedBillAmount 	= $('#receivedAmountValue').val();
	if($('#receivedAmountValue').val() > 0){
		for(let key in creditorDataArray) {
			k 					= k+1;
			if (creditorDataArray.hasOwnProperty(key)) {
				let biils 			= creditorDataArray[key];
				let balanceAmount 	= biils.balAmount;
				
				if(receivedBillAmount > 0) {
					diff = receivedBillAmount - balanceAmount;
					checkedUnchecked("chk_" + k , 'true');
					receivedBillAmount = diff;
				}
			}
		}
		
		$(".checkBoxBillCls").prop("disabled",true);
	}
}
